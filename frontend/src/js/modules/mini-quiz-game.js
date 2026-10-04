import { clearChildren, el } from '../utils/dom-helpers.js';
import {
  createMinigameAttemptToken, getMinigameStats, saveMinigameAttempt,
} from '../services/minigame-service.js';
import { session } from './session.js';

const TOTAL_QUESTIONS = 8;
const POINTS_PER_ANSWER = 10;
const STREAK_BONUS = 5;

export function renderMiniQuizGame(container, config) {
  clearChildren(container);
  const heading = el('header', 'vista-cabecera');
  heading.append(el('h2', '', config.title));
  heading.append(el('p', '', config.description));
  container.append(heading);

  const game = buildGame(config);
  container.append(game.root);
  startGame(game, config);
}

function buildGame(config) {
  const root = el('section', 'mini-quiz-game');
  const summary = el('div', 'mini-calc-summary');
  const progress = el('span', '', 'Reto 1 de 8');
  const score = el('span', '', 'Puntos: 0');
  const streak = el('span', '', 'Racha: 0');
  const timer = el('span', '', 'Tiempo: 0:00');
  summary.append(progress, score, streak, timer);

  const progressTrack = config.createProgressTrack?.();
  const scene = config.createScene?.();

  const prompt = el('div', 'mini-calc-prompt');
  const choices = el('div', 'mini-quiz-choices');
  const status = el('p', 'mini-calc-status', 'Elige una respuesta.');
  const records = el('p', 'mini-calc-records', 'Cargando tus récords...');
  const actions = el('div', 'mini-calc-actions');
  const next = el('button', 'btn btn-primario', 'Comprobar respuesta');
  next.type = 'button';
  next.hidden = true;
  actions.append(next);
  root.append(summary);
  if (progressTrack) root.append(progressTrack.element);
  if (scene) root.append(scene.element);
  root.append(prompt, choices, status, records, actions);
  return { root, progress, score, streak, timer, prompt, choices, status, records, next, progressTrack, scene };
}

function startGame(game, config) {
  const state = { round: 0, points: 0, streak: 0, attemptToken: null, startedAt: Date.now() };
  game.choices.addEventListener('click', (event) => chooseAnswer(event, state, game, config));
  game.next.addEventListener('click', () => {
    if (game.next.dataset.action === 'next') loadQuestion(state, game, config);
    else if (game.next.dataset.action === 'retry-save') saveAttempt(state, game, config);
    else if (game.next.dataset.action === 'replay') restartGame(state, game, config);
  });
  startTimer(state, game);
  loadStats(game, config);
  loadQuestion(state, game, config);
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
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

async function loadStats(game, config) {
  try {
    const stats = await getMinigameStats(config.gameCode);
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

function loadQuestion(state, game, config) {
  if (state.round >= TOTAL_QUESTIONS) return finishGame(state, game, config);
  game.progressTrack?.update(state.round);
  state.question = config.createQuestion();
  game.scene?.showQuestion(state.question);
  game.progress.textContent = `Reto ${state.round + 1} de ${TOTAL_QUESTIONS}`;
  game.prompt.replaceChildren(el('span', 'mini-calc-label', 'ELIGE LA RESPUESTA'), el('strong', '', state.question.prompt));
  game.choices.replaceChildren(...state.question.choices.map((choice, index) => createChoice(choice, index)));
  game.status.textContent = 'Elige una respuesta.';
  game.next.hidden = true;
  game.next.dataset.action = '';
}

function createChoice(label, index) {
  const button = el('button', 'mini-quiz-choice', label);
  button.type = 'button';
  button.dataset.index = String(index);
  return button;
}

function chooseAnswer(event, state, game, config) {
  const choice = event.target.closest('[data-index]');
  if (!choice || game.next.dataset.action) return;
  if (Number(choice.dataset.index) !== state.question.correctIndex) {
    state.streak = 0;
    game.streak.textContent = 'Racha: 0';
    game.status.textContent = 'Esa no es. Inténtalo de nuevo; puedes revisar las opciones.';
    return;
  }
  awardAnswer(state, game, config);
}

function awardAnswer(state, game, config) {
  state.round += 1;
  state.streak += 1;
  const bonus = state.streak % 3 === 0 ? STREAK_BONUS : 0;
  state.points += POINTS_PER_ANSWER + bonus;
  game.score.textContent = `Puntos: ${state.points}`;
  game.streak.textContent = `Racha: ${state.streak}`;
  game.progressTrack?.update(state.round);
  game.scene?.revealAnswer(state.question);
  game.choices.querySelectorAll('button').forEach((button) => { button.disabled = true; });
  if (state.round === TOTAL_QUESTIONS) return finishGame(state, game, config);
  game.status.textContent = bonus ? `¡Correcto! Bonificación de racha: +${bonus} puntos.` : '¡Correcto! +10 puntos.';
  game.next.hidden = false;
  game.next.textContent = 'Siguiente reto';
  game.next.dataset.action = 'next';
}

function finishGame(state, game, config) {
  state.durationSeconds = Math.max(1, elapsedSeconds(state));
  clearInterval(state.timerId);
  state.timerId = null;
  game.timer.textContent = `Tiempo: ${formatTime(state.durationSeconds)}`;
  game.prompt.replaceChildren(el('strong', '', '¡Reto completado!'));
  game.choices.replaceChildren();
  game.status.textContent = `Terminaste con ${state.points} puntos en ${formatTime(state.durationSeconds)}. Guardando partida...`;
  game.next.hidden = false;
  game.next.disabled = true;
  saveAttempt(state, game, config);
}

async function saveAttempt(state, game, config) {
  state.attemptToken ||= createMinigameAttemptToken();
  game.next.disabled = true;
  game.next.textContent = 'Guardando...';
  try {
    const stats = await saveMinigameAttempt({
      gameCode: config.gameCode,
      attemptToken: state.attemptToken,
      score: state.points,
      durationSeconds: state.durationSeconds,
    });
    session.reload().catch(() => {});
    renderStats(game.records, stats);
    game.status.textContent = stats.points_awarded
      ? `Partida guardada: +${state.points} puntos para tu puntaje, en ${formatTime(state.durationSeconds)}.`
      : 'Esta partida ya estaba guardada; tus puntos no se duplicaron.';
    game.next.dataset.action = 'replay';
    game.next.textContent = 'Jugar otra vez';
  } catch {
    game.status.textContent = 'No se pudo guardar. Comprueba tu conexión y reintenta.';
    game.next.dataset.action = 'retry-save';
    game.next.textContent = 'Reintentar guardado';
  } finally {
    game.next.disabled = false;
  }
}

function restartGame(state, game, config) {
  state.round = 0;
  state.points = 0;
  state.streak = 0;
  state.durationSeconds = 0;
  state.attemptToken = null;
  game.score.textContent = 'Puntos: 0';
  game.streak.textContent = 'Racha: 0';
  startTimer(state, game);
  loadQuestion(state, game, config);
}
