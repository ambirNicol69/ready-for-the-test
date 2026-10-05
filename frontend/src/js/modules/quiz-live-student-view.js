import { el, clearChildren } from '../utils/dom-helpers.js';
import { createAlert } from '../utils/ui.js';
import { on } from '../utils/events.js';
import { session } from './session.js';
import * as quiz from '../services/quiz-service.js';

let activeGame = null;

on('route', ({ hash }) => {
  if (hash !== '#/salas') stopActiveGame();
});

export function renderLiveStudent(zone, joined, onExit) {
  stopActiveGame();
  const attemptId = Number(joined.attempt_id);
  const panel = el('section', 'cajon quiz-live-student');
  zone.replaceChildren(panel);

  let pollTimer = null;
  let clockTimer = null;
  let polling = false;
  let submitting = false;
  let disposed = false;
  let pointsReloaded = false;
  let lastStateKey = '';
  let stateReceivedAt = Date.now();
  let stateRemainingMs = 0;
  let timerLabel = null;
  let answeredLabel = null;
  activeGame = { dispose };

  async function refresh() {
    if (polling || disposed) return;
    polling = true;
    try {
      const state = await quiz.getStudentLiveState(attemptId);
      renderState(state);
      if (state.status === 'finished') {
        clearInterval(pollTimer);
        pollTimer = null;
        if (!pointsReloaded) {
          pointsReloaded = true;
          await session.reload().catch(() => {});
        }
      }
    } catch (error) {
      if (!disposed) {
        lastStateKey = '';
        panel.replaceChildren(createAlert(error.message));
      }
    } finally {
      polling = false;
    }
  }

  function renderState(state) {
    stateReceivedAt = Date.now();
    stateRemainingMs = Number(state.remaining_ms || 0);
    const questionId = state.question?.id || '';
    const answerPosition = state.my_answer?.option_position || '';
    const playersKey = JSON.stringify(state.players.map((player) => player.name));
    const leaderboardKey = JSON.stringify(state.leaderboard || []);
    const key = [state.status, state.question_index, questionId, answerPosition, playersKey, leaderboardKey].join('|');
    if (key === lastStateKey) {
      updateClock();
      if (answeredLabel) answeredLabel.textContent = `${state.question?.answered_count || 0} respuestas recibidas`;
      return;
    }
    lastStateKey = key;
    answeredLabel = null;
    clearChildren(panel);
    panel.append(el('h3', '', state.room.title), el('span', 'badge badge-primario quiz-live-room-code', `Código ${state.room.code}`));

    if (state.status === 'waiting') renderWaiting(state);
    if (state.status === 'question') renderQuestion(state);
    if (state.status === 'paused') renderPaused(state);
    if (state.status === 'reveal') renderReveal(state);
    if (state.status === 'finished') renderFinished(state);
  }

  function renderWaiting(state) {
    panel.append(el('h4', '', 'Sala de espera'), el('p', '', 'Ya estás dentro. El docente iniciará la competencia cuando el grupo esté listo.'));
    panel.appendChild(el('p', 'quiz-live-player-count', `${state.players.length} participantes conectados`));
    panel.appendChild(renderLeaderboard(state.players, 'Participantes'));
  }

  function renderQuestion(state) {
    panel.append(
      el('p', 'quiz-live-progress', `Pregunta ${state.question_index} de ${state.total_questions}`),
      el('p', 'quiz-live-timer', ''),
      el('h4', 'quiz-live-question', state.question?.question_text || 'Cargando pregunta…'),
    );
    timerLabel = panel.querySelector('.quiz-live-timer');
    updateClock();
    const options = el('div', 'quiz-live-options');
    const submitted = Boolean(state.my_answer) || submitting;
    (state.question?.options || []).forEach((option) => {
      const choice = el('button', 'quiz-live-option');
      choice.type = 'button';
      const position = Number(option.position);
      choice.append(el('span', 'quiz-live-option-letter', String.fromCharCode(64 + position)), el('span', '', option.text));
      choice.disabled = submitted || state.remaining_ms <= 0;
      if (Number(state.my_answer?.option_position) === position) choice.classList.add('is-selected');
      choice.addEventListener('click', () => sendAnswer(state, position, options));
      options.appendChild(choice);
    });
    panel.append(options);
    panel.appendChild(el('p', 'quiz-live-feedback', state.my_answer ? 'Respuesta registrada. Espera el cierre de la pregunta.' : 'Selecciona una respuesta antes de que termine el tiempo.'));
    answeredLabel = el('p', 'estado-vacio');
    answeredLabel.textContent = `${state.question?.answered_count || 0} respuestas recibidas`;
    panel.appendChild(answeredLabel);
  }

  async function sendAnswer(state, position, options) {
    if (submitting || state.my_answer) return;
    submitting = true;
    options.querySelectorAll('button').forEach((button) => { button.disabled = true; });
    try {
      await quiz.submitLiveAnswer({ attemptId, questionId: Number(state.question.id), optionPosition: position });
      submitting = false;
      await refresh();
    } catch (error) {
      submitting = false;
      const feedback = panel.querySelector('.quiz-live-feedback');
      if (feedback) feedback.textContent = error.message;
      options.querySelectorAll('button').forEach((button) => { button.disabled = false; });
    }
  }

  function renderPaused(state) {
    panel.append(
      el('p', 'quiz-live-progress', `Pregunta ${state.question_index} de ${state.total_questions}`),
      el('h4', 'quiz-live-question', state.question?.question_text || 'La partida está pausada.'),
      el('p', 'quiz-live-feedback', state.my_answer ? 'Tu respuesta ya está registrada.' : 'El docente pausó la partida. Espera para continuar.'),
    );
    panel.appendChild(renderLeaderboard(state.players, 'Marcador actual'));
  }

  function renderReveal(state) {
    const question = state.question;
    const correct = question?.options.find((option) => Number(option.position) === Number(question.correct_option));
    panel.append(
      el('p', 'quiz-live-progress', `Resultados · pregunta ${state.question_index} de ${state.total_questions}`),
      el('h4', 'quiz-live-question', question?.question_text || ''),
      el('p', 'quiz-live-correct', `Respuesta correcta: ${correct?.text || '—'}`),
      el('p', 'quiz-live-feedback', state.my_answer
        ? `Sumaste ${state.my_answer.points_awarded} puntos${state.my_answer.is_correct ? ' · ¡Correcta!' : ''}`
        : 'No registraste una respuesta a tiempo.'),
    );
    panel.appendChild(renderLeaderboard(state.leaderboard, 'Marcador'));
  }

  function renderFinished(state) {
    const mine = state.leaderboard.find((player) => Number(player.user_id) === Number(session.user?.id));
    panel.append(el('h4', '', '¡Competencia finalizada!'), el('p', 'quiz-live-final-score', `Tu puntuación: ${mine?.score || 0} puntos`));
    panel.appendChild(renderLeaderboard(state.leaderboard, 'Podio final'));
    const exit = el('button', 'btn btn-contorno', 'Volver a las salas');
    exit.type = 'button';
    exit.addEventListener('click', () => { dispose(); onExit(); });
    panel.appendChild(exit);
  }

  function renderLeaderboard(players, title) {
    const box = el('div', 'quiz-live-scoreboard');
    box.appendChild(el('h5', '', title));
    const list = el('ol', 'quiz-live-leaderboard');
    players.forEach((player) => list.appendChild(el('li', '', `${player.name} · ${player.score} pts · ${player.correct_count} aciertos`)));
    if (!players.length) list.appendChild(el('li', '', 'Aún no hay participantes.'));
    box.appendChild(list);
    return box;
  }

  function updateClock() {
    if (!timerLabel) return;
    const remaining = Math.max(0, stateRemainingMs - (Date.now() - stateReceivedAt));
    timerLabel.textContent = `Tiempo restante: ${Math.ceil(remaining / 1000)} s`;
  }

  function dispose() {
    disposed = true;
    if (pollTimer) clearInterval(pollTimer);
    if (clockTimer) clearInterval(clockTimer);
    if (activeGame?.dispose === dispose) activeGame = null;
  }

  refresh();
  pollTimer = window.setInterval(refresh, 1000);
  clockTimer = window.setInterval(updateClock, 200);
  return { dispose };
}

function stopActiveGame() {
  if (activeGame) activeGame.dispose();
  activeGame = null;
}
