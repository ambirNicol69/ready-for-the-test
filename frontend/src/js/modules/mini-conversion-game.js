import { randomItem, makeQuestion } from './mini-game-content.js';
import { el } from '../utils/dom-helpers.js';
import { renderMiniQuizGame } from './mini-quiz-game.js';

const CONVERSIONS = [
  { from: 'm', to: 'cm', factor: 100, minimum: 1, maximum: 12 },
  { from: 'km', to: 'm', factor: 1000, minimum: 1, maximum: 9 },
  { from: 'kg', to: 'g', factor: 1000, minimum: 1, maximum: 8 },
  { from: 'min', to: 's', factor: 60, minimum: 1, maximum: 12 },
  { from: 'h', to: 'min', factor: 60, minimum: 1, maximum: 8 },
  { from: 'cm', to: 'm', factor: 0.01, minimum: 50, maximum: 900 },
];

const CONFIG = {
  gameCode: 'carrera-conversiones',
  title: 'Carrera de conversiones',
  description: 'Convierte medidas de longitud, masa y tiempo usadas en física.',
  createQuestion,
  createProgressTrack,
};

export function renderConversionGame(container) {
  renderMiniQuizGame(container, CONFIG);
}

function createQuestion() {
  const conversion = randomItem(CONVERSIONS);
  const quantity = randomInt(conversion.minimum, conversion.maximum);
  const answer = formatNumber(quantity * conversion.factor);
  const alternatives = [
    formatNumber(quantity / conversion.factor),
    formatNumber(quantity * conversion.factor + conversion.factor),
    formatNumber(quantity * conversion.factor - conversion.factor),
  ];
  return makeQuestion(`Convierte ${quantity} ${conversion.from} a ${conversion.to}.`, `${answer} ${conversion.to}`, alternatives.map((value) => `${value} ${conversion.to}`));
}

function randomInt(minimum, maximum) {
  return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

function formatNumber(value) {
  return String(Number(value.toFixed(2)));
}

function createProgressTrack() {
  const track = el('div', 'conversion-race-track');
  track.setAttribute('role', 'progressbar');
  track.setAttribute('aria-label', 'Avance de la carrera');
  track.setAttribute('aria-valuemin', '0');
  track.setAttribute('aria-valuemax', '8');
  const lane = el('div', 'conversion-race-lane');
  const finish = el('span', 'conversion-race-finish', '🏁');
  finish.setAttribute('aria-hidden', 'true');
  const runner = el('span', 'conversion-race-runner', '🏃');
  runner.setAttribute('aria-hidden', 'true');
  const label = el('span', 'conversion-race-label', 'Responde bien para avanzar');
  lane.append(finish, runner);
  track.append(lane, label);

  return {
    element: track,
    update(round) {
      runner.style.left = `${4 + (round / 8) * 92}%`;
      track.setAttribute('aria-valuenow', String(round));
      label.textContent = round === 8 ? '¡Llegaste a la meta!' : `Avance: ${round} de 8 retos`;
    },
  };
}
