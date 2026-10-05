import { randomItem, makeQuestion } from './mini-game-content.js';
import { el } from '../utils/dom-helpers.js';
import { renderMiniQuizGame } from './mini-quiz-game.js';

const REACTIONS = [
  {
    pair: 'bicarbonato de sodio y vinagre',
    result: 'Efervescencia: se libera dióxido de carbono.',
    reagents: [{ name: 'Bicarbonato', icon: '🥄' }, { name: 'Vinagre', icon: '🧴' }],
    effect: 'bubbles',
  },
  {
    pair: 'agua oxigenada y yoduro de potasio',
    result: 'Se forma espuma al liberarse oxígeno.',
    reagents: [{ name: 'Agua oxigenada', icon: '🧪' }, { name: 'Yoduro de potasio', icon: '🧂' }],
    effect: 'foam',
  },
  {
    pair: 'hidróxido de sodio y sulfato de cobre',
    result: 'Aparece un precipitado azul de hidróxido de cobre.',
    reagents: [{ name: 'Hidróxido de sodio', icon: '⚗️' }, { name: 'Sulfato de cobre', icon: '🧪' }],
    effect: 'precipitate',
  },
  {
    pair: 'fenolftaleína e hidróxido de sodio',
    result: 'El indicador cambia a un color rosa intenso.',
    reagents: [{ name: 'Fenolftaleína', icon: '🧪' }, { name: 'Hidróxido de sodio', icon: '⚗️' }],
    effect: 'color',
  },
  {
    pair: 'fenolftaleína y vinagre',
    result: 'La mezcla permanece incolora en medio ácido.',
    reagents: [{ name: 'Fenolftaleína', icon: '🧪' }, { name: 'Vinagre', icon: '🧴' }],
    effect: 'clear',
  },
];

const CONFIG = {
  gameCode: 'mezcla-segura',
  title: 'Mezcla segura',
  description: 'Predice los resultados de las reacciones del laboratorio virtual. No mezcles sustancias reales.',
  interactionLabel: 'OBSERVA LOS REACTIVOS Y PREDICE',
  choiceContainerClass: 'mixture-game-choices',
  createQuestion,
  renderChoices,
  onAnswerResult,
};

export function renderMixtureGame(container) {
  renderMiniQuizGame(container, CONFIG);
}

function createQuestion() {
  const reaction = randomItem(REACTIONS);
  const alternatives = REACTIONS
    .filter((item) => item.result !== reaction.result)
    .map((item) => item.result);
  return {
    ...makeQuestion(`En la simulación, ¿qué ocurre al combinar ${reaction.pair}?`, reaction.result, alternatives),
    reagents: reaction.reagents,
    effect: reaction.effect,
    result: reaction.result,
  };
}

function renderChoices(container, question) {
  const scene = el('div', 'mixing-lab-scene');
  scene.setAttribute('aria-label', 'Escena de mezcla virtual');
  const reagentCards = question.reagents.map((reagent) => {
    const card = el('div', 'mixing-reagent');
    card.append(el('span', 'mixing-reagent-icon', reagent.icon), el('strong', '', reagent.name));
    return card;
  });
  const arrow = el('span', 'mixing-arrow', '＋');
  arrow.setAttribute('aria-hidden', 'true');
  const beaker = el('div', 'mixing-beaker');
  const liquid = el('span', 'mixing-liquid');
  const reaction = el('span', 'mixing-reaction-effect');
  beaker.append(liquid, reaction);
  scene.append(reagentCards[0], arrow, reagentCards[1], beaker);
  const result = el('p', 'mixing-result');
  result.setAttribute('aria-live', 'polite');

  const options = el('div', 'mixing-answer-grid');
  question.choices.forEach((choice, index) => {
    const button = el('button', 'mini-quiz-choice', choice);
    button.type = 'button';
    button.dataset.index = String(index);
    options.append(button);
  });
  container.replaceChildren(scene, result, options);
}

function onAnswerResult(isCorrect, index, state, game) {
  const scene = game.choices.querySelector('.mixing-lab-scene');
  scene.classList.remove('is-mixed', 'is-guess-wrong');
  game.choices.querySelectorAll('.mini-quiz-choice').forEach((button) => button.classList.remove('is-picked'));
  game.choices.querySelector(`[data-index="${index}"]`)?.classList.add('is-picked');
  const result = game.choices.querySelector('.mixing-result');
  if (isCorrect) {
    scene.dataset.reaction = state.question.effect;
    scene.classList.add('is-mixed');
    result.textContent = state.question.result;
    result.classList.add('is-visible');
  } else {
    result.textContent = '';
    result.classList.remove('is-visible');
    scene.classList.add('is-guess-wrong');
  }
}
