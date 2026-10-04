import { makeQuestion } from './mini-game-content.js';
import { el } from '../utils/dom-helpers.js';
import { renderMiniQuizGame } from './mini-quiz-game.js';

const CONFIG = {
  gameCode: 'ordena-ecuacion',
  title: 'Ordena la ecuación',
  description: 'Despeja la variable x en cada ecuación lineal.',
  createQuestion,
  createScene,
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
    equation: `${coefficient}x ${sign} = ${result}`,
    inverseOperation: constant < 0 ? `+ ${Math.abs(constant)}` : `− ${constant}`,
    intermediate: `${coefficient}x = ${result - constant}`,
    divisor: coefficient,
    solution,
  };
}

function createScene() {
  const scene = el('div', 'equation-workbench');
  scene.setAttribute('aria-live', 'polite');
  const original = el('div', 'equation-workbench-stage equation-workbench-original');
  original.append(el('span', 'equation-stage-label', 'ECUACIÓN'), el('strong', 'equation-stage-value'));
  const operation = el('div', 'equation-workbench-stage equation-workbench-operation');
  operation.append(el('span', 'equation-stage-label', 'MISMA OPERACIÓN EN AMBOS LADOS'), el('strong', 'equation-operation-value'));
  const intermediate = el('div', 'equation-workbench-stage equation-workbench-intermediate');
  intermediate.append(el('span', 'equation-stage-label', 'SIMPLIFICA'), el('strong', 'equation-intermediate-value'));
  const division = el('div', 'equation-workbench-stage equation-workbench-division');
  division.append(el('span', 'equation-stage-label', 'AISLA x'), el('strong', 'equation-division-value'));
  scene.append(original, operation, intermediate, division);

  return {
    element: scene,
    showQuestion(question) {
      scene.classList.remove('is-revealed');
      scene.querySelector('.equation-stage-value').textContent = question.equation;
      scene.querySelector('.equation-operation-value').textContent = `${question.inverseOperation} a ambos lados`;
      scene.querySelector('.equation-intermediate-value').textContent = question.intermediate;
      scene.querySelector('.equation-division-value').textContent = `÷ ${question.divisor} → x = ${question.solution}`;
    },
    revealAnswer() {
      scene.classList.add('is-revealed');
    },
  };
}

function randomInt(minimum, maximum) {
  return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}
