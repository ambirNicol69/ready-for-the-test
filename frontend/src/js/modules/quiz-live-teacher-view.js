import { el, clearChildren } from '../utils/dom-helpers.js';
import { createAlert } from '../utils/ui.js';
import * as quiz from '../services/quiz-service.js';

const LIVE_STATUS = {
  disabled: 'Aún no preparada', waiting: 'Esperando estudiantes', question: 'Pregunta activa',
  reveal: 'Resultados de la pregunta', paused: 'Partida pausada', finished: 'Competencia finalizada',
};

export function createLiveHostPanel(room) {
  const element = el('section', 'cajon quiz-live-host');
  let pollTimer = null;
  let isLoading = false;
  let disposed = false;
  let lastStateKey = '';
  let timerLabel = null;
  let answeredLabel = null;

  async function refresh() {
    if (isLoading || disposed) return;
    isLoading = true;
    try {
      renderState(await quiz.getLiveRoomState(room.id));
    } catch (error) {
      renderError(error.message);
    } finally {
      isLoading = false;
    }
  }

  function renderState(state) {
    const questionId = state.question?.id || '';
    const playersKey = JSON.stringify(state.players.map((player) => player.name));
    const leaderboardKey = JSON.stringify(state.leaderboard || []);
    const key = [state.status, state.question_index, questionId, playersKey, leaderboardKey].join('|');
    if (key === lastStateKey) {
      updateIndicators(state);
      return;
    }
    lastStateKey = key;
    timerLabel = null;
    answeredLabel = null;
    clearChildren(element);
    element.append(el('h4', '', 'Competencia en vivo'), el('p', 'quiz-live-status', LIVE_STATUS[state.status] || state.status));
    element.append(el('p', 'quiz-live-code', `Código para estudiantes: ${state.room.code}`));
    if (state.status === 'disabled') renderSetup();
    if (state.status === 'waiting') renderLobby(state);
    if (['question', 'reveal', 'paused'].includes(state.status)) renderQuestion(state);
    if (state.status === 'finished') renderLeaderboard(state.leaderboard, 'Podio final');
  }

  function renderSetup() {
    const label = el('label', 'quiz-live-label', 'Tiempo por pregunta');
    const timer = el('select', 'quiz-live-select');
    timer.setAttribute('aria-label', 'Tiempo límite para cada pregunta');
    [15, 20, 30, 45, 60].forEach((seconds) => {
      const option = el('option', '', `${seconds} segundos`);
      option.value = String(seconds);
      if (seconds === 20) option.selected = true;
      timer.appendChild(option);
    });
    label.appendChild(timer);
    element.append(label, el('p', 'estado-vacio', 'Prepara la sala para abrir la entrada con código y esperar al grupo.'));
    element.appendChild(action('Preparar sala de espera', async () => {
      await quiz.prepareLiveRoom(room.id, Number(timer.value));
      await refresh();
    }));
  }

  function renderLobby(state) {
    element.append(el('p', '', `${state.players.length} estudiante${state.players.length === 1 ? '' : 's'} en la sala.`));
    renderPlayerList(state.players);
    const start = action('Iniciar competencia', async () => {
      await quiz.startLiveRoom(room.id);
      await refresh();
    });
    start.disabled = state.players.length === 0;
    element.append(start, finishButton());
  }

  function renderQuestion(state) {
    const question = state.question;
    element.append(
      el('p', 'quiz-live-progress', `Pregunta ${state.question_index} de ${state.total_questions}`),
      el('p', 'quiz-live-timer', ''),
      el('p', 'quiz-live-question', question?.question_text || 'La pregunta no está disponible.'),
    );
    if (question) renderOptions(question, state.status === 'reveal');
    timerLabel = element.querySelector('.quiz-live-timer');
    updateIndicators(state);
    if (state.status === 'reveal' && question) {
      const correct = question.options.find((option) => Number(option.position) === Number(question.correct_option));
      element.appendChild(el('p', 'quiz-live-correct', `Respuesta correcta: ${correct?.text || '—'}`));
      renderLeaderboard(state.leaderboard, 'Marcador');
    } else {
      answeredLabel = el('p', 'estado-vacio');
      element.appendChild(answeredLabel);
      updateIndicators(state);
    }

    const controls = el('div', 'vista-acciones quiz-live-actions');
    if (state.status === 'question' || state.status === 'paused') {
      controls.appendChild(action(state.status === 'paused' ? 'Reanudar' : 'Pausar', async () => {
        await quiz.toggleLiveRoomPause(room.id);
        await refresh();
      }));
    }
    if (state.status === 'question' || state.status === 'reveal') {
      controls.appendChild(action(state.status === 'reveal' ? 'Siguiente pregunta' : 'Cerrar pregunta ahora', async () => {
        await quiz.advanceLiveRoom(room.id);
        await refresh();
      }, 'btn btn-contorno'));
    }
    controls.appendChild(finishButton());
    element.appendChild(controls);
  }

  function renderOptions(question, reveal) {
    const options = el('div', 'quiz-live-options quiz-live-host-options');
    question.options.forEach((option) => {
      const item = el('div', 'quiz-live-option');
      item.append(el('span', 'quiz-live-option-letter', String.fromCharCode(64 + Number(option.position))));
      item.append(el('span', '', option.text));
      if (reveal && Number(option.position) === Number(question.correct_option)) item.classList.add('is-selected');
      options.appendChild(item);
    });
    element.appendChild(options);
  }

  function updateIndicators(state) {
    if (timerLabel) {
      timerLabel.textContent = state.status === 'paused' ? 'Pausada' : `${Math.ceil(state.remaining_ms / 1000)} segundos`;
    }
    if (answeredLabel) {
      answeredLabel.textContent = `${state.question?.answered_count || 0} de ${state.players.length} respuestas recibidas`;
    }
  }

  function renderPlayerList(players) {
    const list = el('ul', 'quiz-live-player-list');
    players.forEach((player) => list.appendChild(el('li', '', player.name)));
    if (!players.length) list.appendChild(el('li', 'estado-vacio', 'Aún no se ha unido nadie.'));
    element.appendChild(list);
  }

  function renderLeaderboard(players = [], title) {
    element.appendChild(el('h5', '', title));
    const list = el('ol', 'quiz-live-leaderboard');
    players.forEach((player) => {
      list.appendChild(el('li', '', `${player.name} · ${player.score} pts · ${player.correct_count} aciertos`));
    });
    if (!players.length) list.appendChild(el('li', '', 'Sin participantes'));
    element.appendChild(list);
  }

  function finishButton() {
    return action('Finalizar competencia', async () => {
      await quiz.finishLiveRoom(room.id);
      await refresh();
    }, 'btn btn-peligro');
  }

  function renderError(message) {
    lastStateKey = '';
    clearChildren(element);
    element.appendChild(createAlert(message));
  }

  refresh();
  pollTimer = window.setInterval(refresh, 1000);
  return {
    element,
    dispose() {
      disposed = true;
      if (pollTimer) window.clearInterval(pollTimer);
    },
  };
}

function action(label, callback, className = 'btn btn-primario') {
  const button = el('button', className, label);
  button.type = 'button';
  button.addEventListener('click', async () => {
    button.disabled = true;
    try {
      await callback();
    } catch (error) {
      const host = button.closest('.quiz-live-host');
      if (host) host.appendChild(createAlert(error.message));
    } finally {
      button.disabled = false;
    }
  });
  return button;
}
