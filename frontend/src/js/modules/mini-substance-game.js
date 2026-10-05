import { randomItem, makeQuestion } from './mini-game-content.js';
import { el } from '../utils/dom-helpers.js';
import { renderMiniQuizGame } from './mini-quiz-game.js';

const SUBSTANCES = [
  { name: 'Agua', icon: '💧', state: 'líquido', transparency: 'transparente', conductivity: 'no conduce', density: 1 },
  { name: 'Alcohol etílico', icon: '🧴', state: 'líquido', transparency: 'transparente', conductivity: 'no conduce', density: 0.79 },
  { name: 'Agua salada', icon: '🧂', state: 'líquido', transparency: 'transparente', conductivity: 'conduce', density: 1.03 },
  { name: 'Aceite vegetal', icon: '🫒', state: 'líquido', transparency: 'opaco', conductivity: 'no conduce', density: 0.92 },
  { name: 'Hierro', icon: '⚙️', state: 'sólido', transparency: 'opaco', conductivity: 'conduce', density: 7.87 },
  { name: 'Hielo', icon: '🧊', state: 'sólido', transparency: 'transparente', conductivity: 'no conduce', density: 0.92 },
  { name: 'Aluminio', icon: '🥫', state: 'sólido', transparency: 'opaco', conductivity: 'conduce', density: 2.7 },
  { name: 'Dióxido de carbono', icon: '💨', state: 'gas', transparency: 'transparente', conductivity: 'no conduce', density: 0.0018 },
];

const CONFIG = {
  gameCode: 'sustancia-misteriosa',
  title: 'Sustancia misteriosa',
  description: 'Identifica sustancias con las propiedades del catálogo del laboratorio.',
  interactionLabel: 'ANALIZA LAS PISTAS Y ELIGE',
  choiceContainerClass: 'mystery-game-choices',
  createQuestion,
  renderChoices,
  onAnswerResult,
};

export function renderSubstanceGame(container) {
  renderMiniQuizGame(container, CONFIG);
}

function createQuestion() {
  const substance = randomItem(SUBSTANCES);
  const otherNames = SUBSTANCES.filter((item) => item.name !== substance.name).map((item) => item.name);
  const density = substance.density < 0.01 ? substance.density.toFixed(4) : substance.density.toFixed(2);
  return {
    ...makeQuestion('¿Qué sustancia contiene la muestra misteriosa?', substance.name, otherNames),
    clues: [
      { label: 'Estado físico', value: substance.state },
      { label: 'Apariencia', value: substance.transparency },
      { label: 'Conductividad eléctrica', value: substance.conductivity },
      { label: 'Densidad', value: `${density} g/mL` },
    ],
    revealName: substance.name,
    revealIcon: substance.icon,
  };
}

function renderChoices(container, question) {
  const scene = el('div', 'mystery-lab-scene');
  const specimen = el('div', 'mystery-specimen');
  specimen.setAttribute('aria-live', 'polite');
  specimen.append(el('span', 'mystery-specimen-mark', '❔'), el('strong', 'mystery-specimen-name', 'Muestra sin identificar'));
  scene.append(el('span', 'mystery-lab-label', 'MUESTRA'), specimen);

  const clueGrid = el('div', 'mystery-clue-grid');
  clueGrid.setAttribute('aria-live', 'polite');
  const clueCards = question.clues.map((clue, index) => {
    const card = el('div', 'mystery-clue');
    card.append(el('span', 'mystery-clue-number', `PISTA ${index + 1}`), el('strong', 'mystery-clue-label', clue.label));
    card.append(el('span', 'mystery-clue-value', 'Bloqueada'));
    clueGrid.append(card);
    return { card, clue };
  });

  const revealButton = el('button', 'btn btn-secundario mystery-reveal-button', `Revelar pista 1 de ${clueCards.length}`);
  revealButton.type = 'button';
  revealButton.addEventListener('click', () => {
    const next = clueCards.find((item) => !item.card.classList.contains('is-revealed'));
    if (!next) return;
    next.card.querySelector('.mystery-clue-value').textContent = next.clue.value;
    next.card.classList.add('is-revealed');
    const revealed = clueCards.filter((item) => item.card.classList.contains('is-revealed')).length;
    revealButton.textContent = revealed === clueCards.length
      ? 'Todas las pistas reveladas'
      : `Revelar pista ${revealed + 1} de ${clueCards.length}`;
    revealButton.disabled = revealed === clueCards.length;
  });

  const options = el('div', 'mystery-substance-options');
  question.choices.forEach((choice, index) => {
    const button = el('button', 'mini-quiz-choice', choice);
    button.type = 'button';
    button.dataset.index = String(index);
    options.append(button);
  });
  container.replaceChildren(scene, clueGrid, revealButton, options);
}

function onAnswerResult(isCorrect, index, state, game) {
  game.choices.querySelectorAll('.mini-quiz-choice').forEach((button) => button.classList.remove('is-picked'));
  game.choices.querySelector(`[data-index="${index}"]`)?.classList.add('is-picked');
  const specimen = game.choices.querySelector('.mystery-specimen');
  specimen.classList.remove('is-identified', 'is-guess-wrong');
  if (isCorrect) {
    specimen.querySelector('.mystery-specimen-mark').textContent = state.question.revealIcon;
    specimen.querySelector('.mystery-specimen-name').textContent = state.question.revealName;
    specimen.classList.add('is-identified');
  } else {
    specimen.classList.add('is-guess-wrong');
  }
}
