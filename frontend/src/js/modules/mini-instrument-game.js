import { randomItem, makeQuestion } from './mini-game-content.js';
import { el } from '../utils/dom-helpers.js';
import { renderMiniQuizGame } from './mini-quiz-game.js';

const INSTRUMENTS = [
  { name: 'Balanza', task: 'medir la masa de una muestra', icon: '⚖️', target: 'Muestra', targetIcon: '🪨' },
  { name: 'Dinamómetro', task: 'medir la fuerza que ejerce un objeto', icon: '🪝', target: 'Objeto suspendido', targetIcon: '🧱' },
  { name: 'Termómetro', task: 'medir la temperatura de un líquido', icon: '🌡️', target: 'Líquido', targetIcon: '🥛' },
  { name: 'Cronómetro', task: 'medir cuánto dura una caída', icon: '⏱️', target: 'Caída de un objeto', targetIcon: '🍎' },
  { name: 'Probeta graduada', task: 'medir el volumen de un líquido', icon: '🧪', target: 'Volumen del líquido', targetIcon: '🫗' },
  { name: 'Regla', task: 'medir la longitud de una barra pequeña', icon: '📏', target: 'Barra pequeña', targetIcon: '🪵' },
];

const CONFIG = {
  gameCode: 'instrumento-fisica',
  title: '¿Qué instrumento usarías?',
  description: 'Relaciona cada medición de física con el instrumento adecuado.',
  interactionLabel: 'SELECCIONA UN INSTRUMENTO',
  choiceContainerClass: 'instrument-game-choices',
  createQuestion,
  renderChoices,
  onAnswerResult,
};

export function renderInstrumentGame(container) {
  renderMiniQuizGame(container, CONFIG);
}

function createQuestion() {
  const instrument = randomItem(INSTRUMENTS);
  const alternatives = INSTRUMENTS
    .filter((item) => item.name !== instrument.name)
    .map((item) => item.name);
  return {
    ...makeQuestion(`¿Qué instrumento usarías para ${instrument.task}?`, instrument.name, alternatives),
    target: instrument.target,
    targetIcon: instrument.targetIcon,
  };
}

function renderChoices(container, question) {
  const scene = el('div', 'instrument-measurement-scene');
  scene.setAttribute('aria-hidden', 'true');
  const target = el('div', 'instrument-measurement-target');
  target.append(el('span', 'instrument-target-icon', question.targetIcon), el('strong', '', question.target));
  const measuringLine = el('span', 'instrument-measurement-line', '⋯');
  const tray = el('span', 'instrument-approach-icon', '🔎');
  scene.append(target, measuringLine, tray);

  const options = el('div', 'instrument-choice-grid');
  question.choices.forEach((name, index) => {
    const instrument = INSTRUMENTS.find((item) => item.name === name);
    const button = el('button', 'instrument-choice', '');
    button.type = 'button';
    button.dataset.index = String(index);
    const icon = el('span', 'instrument-choice-icon', instrument?.icon || '🔧');
    icon.setAttribute('aria-hidden', 'true');
    button.append(icon, el('span', '', name));
    options.append(button);
  });
  container.replaceChildren(scene, options);
}

function onAnswerResult(isCorrect, index, _state, game) {
  game.choices.querySelectorAll('.instrument-choice').forEach((button) => {
    button.classList.remove('is-selected', 'is-correct', 'is-incorrect');
  });
  const selected = game.choices.querySelector(`[data-index="${index}"]`);
  selected?.classList.add('is-selected', isCorrect ? 'is-correct' : 'is-incorrect');
  const target = game.choices.querySelector('.instrument-measurement-target');
  target?.classList.remove('is-target-hit', 'is-target-miss');
  target?.classList.add(isCorrect ? 'is-target-hit' : 'is-target-miss');
}
