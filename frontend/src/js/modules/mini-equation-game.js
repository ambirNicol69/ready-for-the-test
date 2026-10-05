import { makeQuestion } from './mini-game-content.js';
import { el } from '../utils/dom-helpers.js';
import { renderMiniQuizGame } from './mini-quiz-game.js';

const CONFIG = {
  gameCode: 'ordena-ecuacion',
  title: 'Ordena la ecuación',
  description: 'Despeja la variable x en cada ecuación lineal.',
  interactionLabel: 'ARMA EL ORDEN DE LOS PASOS',
  incorrectMessage: 'Ese orden no es correcto. Reorganiza las fichas e inténtalo otra vez.',
  createQuestion,
  renderChoices,
  handleChoiceClick,
  checkCustomAnswer,
};

export function renderEquationGame(container) {
  renderMiniQuizGame(container, CONFIG);
}

function createQuestion() {
  const coefficient = randomInt(2, 8);
  const constant = randomInt(1, 15) * (Math.random() < 0.5 ? -1 : 1);
  const solution = randomInt(-6, 12);
  const result = coefficient * solution + constant;
  const sign = constant < 0 ? `− ${Math.abs(constant)}` : `+ ${constant}`;
  const removeTerm = constant < 0 ? `suma ${Math.abs(constant)}` : `resta ${constant}`;
  const answer = `Primero ${removeTerm} en ambos lados; luego divide entre ${coefficient}.`;
  const distractors = [
    `Primero divide entre ${coefficient}; luego ${removeTerm} en ambos lados.`,
    `Primero ${constant < 0 ? 'resta' : 'suma'} ${Math.abs(constant)} en ambos lados; luego divide entre ${coefficient}.`,
    `Primero resta ${coefficient} en ambos lados; luego divide entre ${Math.abs(constant) || 1}.`,
  ];
  return {
    ...makeQuestion(`¿En qué orden despejas x en ${coefficient}x ${sign} = ${result}?`, answer, distractors),
    correctOrder: ['inverse', 'divide'],
    operations: [
      { code: 'inverse', label: constant < 0 ? `Sumar ${Math.abs(constant)} a ambos lados` : `Restar ${constant} a ambos lados` },
      { code: 'divide', label: `Dividir ambos lados entre ${coefficient}` },
      { code: 'flip', label: 'Cambiar el signo de toda la ecuación' },
      { code: 'constant', label: 'Mover el término independiente sin operar en ambos lados' },
    ],
  };
}

function renderChoices(container, question, state) {
  state.operationOrder = [];
  const builder = el('div', 'equation-order-builder');
  const slots = el('div', 'equation-order-slots');
  [0, 1].forEach((index) => {
    const slot = el('div', 'equation-order-slot');
    slot.append(el('span', 'equation-order-slot-label', `Paso ${index + 1}`), el('strong', `equation-order-slot-${index}`, 'Elige una ficha'));
    slots.append(slot);
  });
  const tiles = el('div', 'equation-operation-tiles');
  question.operations.forEach((operation) => {
    const tile = el('button', 'equation-operation-tile', operation.label);
    tile.type = 'button';
    tile.dataset.operation = operation.code;
    tiles.append(tile);
  });
  const clear = el('button', 'btn btn-secundario equation-order-clear', 'Borrar selección');
  clear.type = 'button';
  clear.dataset.clearOrder = 'true';
  builder.append(slots, tiles, clear);
  container.replaceChildren(builder);
}

function handleChoiceClick(event, state, game) {
  if (['next', 'retry-save', 'replay'].includes(game.next.dataset.action)) return;
  if (event.target.closest('[data-clear-order]')) {
    resetOrder(state, game);
    return;
  }
  const tile = event.target.closest('[data-operation]');
  if (!tile || tile.disabled || state.operationOrder.length >= 2) return;
  state.operationOrder.push(tile.dataset.operation);
  tile.disabled = true;
  const selected = state.question.operations.filter((operation) => state.operationOrder.includes(operation.code));
  selected.forEach((operation, index) => {
    game.choices.querySelector(`.equation-order-slot-${index}`).textContent = operation.label;
  });
  game.status.textContent = state.operationOrder.length === 2
    ? 'Revisa el orden y comprueba tu respuesta.'
    : 'Elige la segunda operación.';
  if (state.operationOrder.length === 2) {
    game.next.hidden = false;
    game.next.textContent = 'Comprobar orden';
    game.next.dataset.action = 'check-custom';
  }
}

function checkCustomAnswer(state, game, submit) {
  const correct = state.operationOrder.every((operation, index) => operation === state.question.correctOrder[index]);
  if (!correct) resetOrder(state, game);
  submit(correct);
}

function resetOrder(state, game) {
  state.operationOrder = [];
  game.choices.querySelectorAll('[data-operation]').forEach((tile) => { tile.disabled = false; });
  game.choices.querySelector('.equation-order-slot-0').textContent = 'Elige una ficha';
  game.choices.querySelector('.equation-order-slot-1').textContent = 'Elige una ficha';
  game.next.hidden = true;
  game.next.dataset.action = '';
}

function randomInt(minimum, maximum) {
  return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}
