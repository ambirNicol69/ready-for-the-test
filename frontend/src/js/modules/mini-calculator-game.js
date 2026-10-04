import { Calculator } from './calculator.js';
import { clearChildren, el } from '../utils/dom-helpers.js';
import {
  createMinigameAttemptToken, getMinigameStats, saveMinigameAttempt,
} from '../services/minigame-service.js';
import { session } from './session.js';

const TOTAL_QUESTIONS = 8;
const POINTS_PER_ANSWER = 10;
const STREAK_BONUS = 5;
const GAME_CODE = 'reto-calculadora';
const CALCULATOR_KEYS = [
  ['7', '8', '9', '/'], ['4', '5', '6', '*'], ['1', '2', '3', '-'],
  ['C', '0', '.', '+'], ['√', 'x²', '⌫', '='],
];

export function renderMiniCalculatorGame(container) {
  clearChildren(container);
  const heading = el('header', 'vista-cabecera');
  heading.append(el('h2', '', 'Reto Calculadora'));
  heading.append(el('p', '', 'Resuelve cada reto usando la calculadora del juego.'));
  container.append(heading);

  const game = buildGame();
  container.append(game.root);
  startGame(game);
}

function buildGame() {
  const root = el('section', 'mini-calc-game');
  const summary = el('div', 'mini-calc-summary');
  const progress = el('span', '', 'Reto 1 de 8');
  const score = el('span', '', 'Puntos: 0');
  const streak = el('span', '', 'Racha: 0');
  const timer = el('span', '', 'Tiempo: 0:00');
  summary.append(progress, score, streak, timer);

  const prompt = el('div', 'mini-calc-prompt');
  const status = el('p', 'mini-calc-status', 'Pulsa las teclas y luego comprueba tu resultado.');
  const records = el('p', 'mini-calc-records', 'Cargando tus récords...');
  const display = document.createElement('input');
  display.id = 'miniCalcDisplay';
  display.className = 'mini-calc-display';
  display.readOnly = true;
  display.setAttribute('aria-label', 'Pantalla de la calculadora del minijuego');

  const keypad = el('div', 'mini-calc-keypad');
  CALCULATOR_KEYS.flat().forEach((key) => keypad.append(createKey(key)));
  const history = el('ul');
  history.id = 'miniCalcHistory';
  history.hidden = true;

  const actions = el('div', 'mini-calc-actions');
  const check = el('button', 'btn btn-primario', 'Comprobar resultado');
  check.type = 'button';
  check.dataset.action = 'check';
  actions.append(check);
  root.append(summary, prompt, display, keypad, status, records, actions, history);
  return { root, prompt, progress, score, streak, timer, status, records, display, keypad, check };
}

function createKey(key) {
  const button = el('button', 'mini-calc-key', key);
  button.type = 'button';
  button.dataset.key = key;
  button.setAttribute('aria-label', key === '√' ? 'raíz cuadrada' : key);
  return button;
}

function startGame(game) {
  const calculator = new Calculator('miniCalcDisplay', 'miniCalcHistory');
  const state = { round: 0, points: 0, streak: 0, challenge: null, attemptToken: null, startedAt: Date.now() };
  game.keypad.addEventListener('click', (event) => handleKey(event, calculator, game));
  game.check.addEventListener('click', () => {
    if (game.check.dataset.action === 'next') loadChallenge(state, game, calculator);
    else if (game.check.dataset.action === 'replay') restartGame(state, game, calculator);
    else if (game.check.dataset.action === 'retry-save') saveAttempt(state, game);
    else checkAnswer(state, game, calculator);
  });
  startTimer(state, game);
  loadStats(game);
  loadChallenge(state, game, calculator);
}

function startTimer(state, game) {
  if (state.timerId) clearInterval(state.timerId);
  state.startedAt = Date.now();
  game.timer.textContent = 'Tiempo: 0:00';
  state.timerId = setInterval(() => {
    if (!game.root.isConnected) {
      clearInterval(state.timerId);
      state.timerId = null;
      return;
    }
    game.timer.textContent = `Tiempo: ${formatTime(elapsedSeconds(state))}`;
  }, 1000);
}

function elapsedSeconds(state) {
  return Math.floor((Date.now() - state.startedAt) / 1000);
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}

async function loadStats(game) {
  try {
    const stats = await getMinigameStats(GAME_CODE);
    renderStats(game.records, stats);
  } catch {
    game.records.textContent = 'Los récords aparecerán cuando el servidor esté disponible.';
  }
}

function renderStats(element, stats) {
  if (stats.attempts === 0) {
    element.textContent = 'Aún no tienes partidas guardadas.';
    return;
  }
  element.textContent = `Récord: ${stats.best_score} puntos · Mejor tiempo: ${formatTime(stats.best_time_seconds)} · Partidas: ${stats.attempts}`;
}

function handleKey(event, calculator, game) {
  const button = event.target.closest('[data-key]');
  if (!button || game.check.dataset.action !== 'check') return;
  const { key } = button.dataset;
  if (/^\d$/.test(key)) calculator.pressNumber(key);
  else if (['+', '-', '*', '/'].includes(key)) calculator.pressOperator(key);
  else if (key === '.') calculator.pressDecimalPoint();
  else if (key === 'C') calculator.clearAll();
  else if (key === '⌫') calculator.deleteLastDigit();
  else if (key === '=') calculator.calculateResult();
  else if (key === '√') calculator.applyFunction('sqrt');
  else if (key === 'x²') calculator.applyFunction('cuadrado');
}

function checkAnswer(state, game, calculator) {
  const answer = Number(calculator.currentValue);
  if (!Number.isFinite(answer)) {
    game.status.textContent = 'Usa la calculadora para obtener un resultado válido.';
    return;
  }
  if (Math.abs(answer - state.challenge.answer) > 0.000001) {
    state.streak = 0;
    game.streak.textContent = 'Racha: 0';
    game.status.textContent = 'Todavía no. Revisa la operación e inténtalo de nuevo.';
    return;
  }
  awardAnswer(state, game);
}

function awardAnswer(state, game) {
  state.round += 1;
  state.streak += 1;
  const bonus = state.streak % 3 === 0 ? STREAK_BONUS : 0;
  state.points += POINTS_PER_ANSWER + bonus;
  game.score.textContent = `Puntos: ${state.points}`;
  game.streak.textContent = `Racha: ${state.streak}`;
  if (state.round === TOTAL_QUESTIONS) return finishGame(state, game);
  game.status.textContent = bonus ? `¡Correcto! Racha: +${bonus} puntos extra.` : '¡Correcto! +10 puntos.';
  game.check.textContent = 'Siguiente reto';
  game.check.dataset.action = 'next';
}

function loadChallenge(state, game, calculator) {
  if (state.round >= TOTAL_QUESTIONS) return;
  if (game.check.dataset.action === 'next') {
    game.check.dataset.action = 'check';
    game.check.textContent = 'Comprobar resultado';
  }
  calculator.clearAll();
  state.challenge = createChallenge();
  game.progress.textContent = `Reto ${state.round + 1} de ${TOTAL_QUESTIONS}`;
  game.prompt.replaceChildren(el('span', 'mini-calc-label', 'RESUELVE'), el('strong', '', state.challenge.prompt));
  game.status.textContent = 'Pulsa las teclas y luego comprueba tu resultado.';
}

function createChallenge() {
  const type = Math.floor(Math.random() * 6);
  const first = randomInt(3, 20);
  const second = randomInt(2, 12);
  if (type === 0) return { prompt: `${first} + ${second}`, answer: first + second };
  if (type === 1) return { prompt: `${first + second} − ${second}`, answer: first };
  if (type === 2) return { prompt: `${first} × ${second}`, answer: first * second };
  if (type === 3) return { prompt: `${first * second} ÷ ${second}`, answer: first };
  if (type === 4) return { prompt: `${first}²`, answer: first * first };
  const root = randomInt(2, 12);
  return { prompt: `√ ${root * root}`, answer: root };
}

function randomInt(minimum, maximum) {
  return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

function finishGame(state, game) {
  state.durationSeconds = Math.max(1, elapsedSeconds(state));
  clearInterval(state.timerId);
  state.timerId = null;
  game.timer.textContent = `Tiempo: ${formatTime(state.durationSeconds)}`;
  game.prompt.replaceChildren(el('strong', '', '¡Reto completado!'));
  game.status.textContent = `Terminaste con ${state.points} puntos en ${formatTime(state.durationSeconds)}. Guardando partida...`;
  game.check.disabled = true;
  saveAttempt(state, game);
}

async function saveAttempt(state, game) {
  state.attemptToken ||= createMinigameAttemptToken();
  game.check.disabled = true;
  game.check.textContent = 'Guardando...';
  try {
    const stats = await saveMinigameAttempt({
      gameCode: GAME_CODE,
      attemptToken: state.attemptToken,
      score: state.points,
      durationSeconds: state.durationSeconds,
    });
    session.reload().catch(() => {});
    renderStats(game.records, stats);
    game.status.textContent = stats.points_awarded
      ? `Partida guardada: +${state.points} puntos para tu puntaje, en ${formatTime(state.durationSeconds)}.`
      : 'Esta partida ya estaba guardada; tus puntos no se duplicaron.';
    game.check.dataset.action = 'replay';
    game.check.textContent = 'Jugar otra vez';
  } catch {
    game.status.textContent = 'No se pudo guardar. Comprueba tu conexión y reintenta.';
    game.check.dataset.action = 'retry-save';
    game.check.textContent = 'Reintentar guardado';
  } finally {
    game.check.disabled = false;
  }
}

function restartGame(state, game, calculator) {
  state.round = 0;
  state.points = 0;
  state.streak = 0;
  state.durationSeconds = 0;
  state.attemptToken = null;
  game.score.textContent = 'Puntos: 0';
  game.streak.textContent = 'Racha: 0';
  game.check.dataset.action = 'check';
  game.check.textContent = 'Comprobar resultado';
  startTimer(state, game);
  loadChallenge(state, game, calculator);
}
