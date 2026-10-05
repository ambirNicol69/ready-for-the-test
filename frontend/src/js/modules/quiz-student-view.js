import { el, clearChildren } from '../utils/dom-helpers.js';
import { createViewHeader, createAlert, createField, clearFieldError, setFieldError } from '../utils/ui.js';
import { showToast } from '../utils/toast.js';
import { isRequired } from '../utils/validators.js';
import * as quiz from '../services/quiz-service.js';
import { session } from './session.js';
import { renderLiveStudent } from './quiz-live-student-view.js';

const LETTERS = ['A', 'B', 'C', 'D'];

let attempt = null;
let answers = {};
let currentIndex = 0;
let activeLiveGame = null;

export function renderQuizStudent(container) {
  activeLiveGame?.dispose();
  activeLiveGame = null;
  container.appendChild(createViewHeader(
    'Salas de examen',
    'Únete con el código que te compartió tu docente.'
  ));

  const joinCard = el('section', 'cajon');
  joinCard.appendChild(el('h3', '', 'Unirse a una sala'));
  const form = el('form', 'formulario');

  const codeField = createField({ id: 'codigoSala', label: 'Código de la sala', required: true });
  codeField.input.maxLength = 6;
  codeField.input.placeholder = 'Ej: TR3WLK';

  const messageBox = el('div');
  const joinButton = el('button', 'btn btn-primario', 'Entrar');
  joinButton.type = 'submit';

  form.appendChild(codeField.wrapper);
  form.appendChild(messageBox);
  form.appendChild(joinButton);
  joinCard.appendChild(form);
  container.appendChild(joinCard);

  const playZone = el('div');
  playZone.id = 'zonaJuego';
  container.appendChild(playZone);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearChildren(messageBox);
    clearFieldError(codeField);
    const code = codeField.input.value.trim().toUpperCase();
    if (!isRequired(code)) {
      setFieldError(codeField, 'Escribe el código');
      return;
    }
    joinButton.disabled = true;
    try {
      const joined = await quiz.joinRoomWithCode(code);
      if (joined.mode === 'live') {
        joinCard.hidden = true;
        activeLiveGame = renderLiveStudent(playZone, joined, () => {
          activeLiveGame = null;
          joinCard.hidden = false;
          clearChildren(playZone);
          codeField.input.value = '';
        });
        return;
      }
      attempt = joined;
      answers = {};
      currentIndex = 0;
      renderPlay(playZone);
    } catch (error) {
      messageBox.appendChild(createAlert(error.message));
    } finally {
      joinButton.disabled = false;
    }
  });
}

function renderPlay(zone) {
  clearChildren(zone);
  if (!attempt) {
    return;
  }

  const card = el('section', 'cajon');
  card.appendChild(el('h3', '', attempt.room.title));
  card.appendChild(el('span', 'badge badge-primario', attempt.room.code));

  const progress = el('div', 'barra-progreso');
  const progressFill = el('div');
  progressFill.style.width = `${((currentIndex + 1) / attempt.questions.length) * 100}%`;
  progress.appendChild(progressFill);
  card.appendChild(progress);

  const question = attempt.questions[currentIndex];
  const flashcard = el('div', 'flashcard');
  flashcard.appendChild(el('p', 'flashcard-pregunta', `${currentIndex + 1}. ${question.question_text}`));
  buildOptions(flashcard, question);
  card.appendChild(flashcard);

  const actions = el('div', 'vista-acciones');
  const previousButton = el('button', 'btn btn-contorno', '← Anterior');
  previousButton.disabled = currentIndex === 0;
  previousButton.addEventListener('click', () => {
    currentIndex--;
    renderPlay(zone);
  });
  actions.appendChild(previousButton);

  if (currentIndex < attempt.questions.length - 1) {
    const nextButton = el('button', 'btn btn-primario', 'Siguiente →');
    nextButton.addEventListener('click', () => {
      currentIndex++;
      renderPlay(zone);
    });
    actions.appendChild(nextButton);
  } else {
    const submitButton = el('button', 'btn btn-ambar', 'Entregar respuestas');
    submitButton.addEventListener('click', () => submitQuiz(zone));
    actions.appendChild(submitButton);
  }

  card.appendChild(actions);
  zone.appendChild(card);
}

function buildOptions(flashcard, question) {
  const optionsBox = el('div', 'flashcard-opciones');
  for (const option of question.options) {
    const optionButton = el('button', 'opcion');
    optionButton.type = 'button';
    optionButton.appendChild(el('span', 'opcion-marcador', LETTERS[option.position - 1]));
    optionButton.appendChild(el('span', '', option.text));
    if (answers[question.id] === option.position) {
      optionButton.classList.add('is-seleccionada');
    }
    optionButton.addEventListener('click', () => {
      answers[question.id] = option.position;
      markSelectedOption(optionsBox, option.position);
    });
    optionsBox.appendChild(optionButton);
  }
  flashcard.appendChild(optionsBox);
}

function markSelectedOption(box, position) {
  for (const optionButton of box.querySelectorAll('.opcion')) {
    const marker = optionButton.querySelector('.opcion-marcador').textContent;
    optionButton.classList.toggle('is-seleccionada', LETTERS.indexOf(marker) + 1 === position);
  }
}

async function submitQuiz(zone) {
  if (Object.keys(answers).length !== attempt.questions.length) {
    showToast('Responde todas las preguntas', 'error');
    return;
  }
  const answersPayload = Object.entries(answers).map(([questionId, optionIndex]) => ({
    question_id: Number(questionId),
    option_index: optionIndex,
  }));

  try {
    const result = await quiz.submitAnswers({ attemptId: attempt.attempt_id, answers: answersPayload });
    attempt = null;
    renderQuizResult(zone, result);
    await session.reload();
    showToast(`¡+${result.points_awarded} puntos!`, 'ok');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

function renderQuizResult(zone, result) {
  clearChildren(zone);
  const card = el('div', 'cajon');
  card.appendChild(el('p', 'bandeja-nombre', `Resultado: ${result.score} puntos`));
  card.appendChild(el('p', 'bandeja-efecto', `Respondiste correctamente ${result.correct_count} de ${result.total_questions}`));
  const progress = el('div', 'barra-progreso');
  const fill = el('div');
  fill.style.width = `${(result.correct_count / result.total_questions) * 100}%`;
  progress.appendChild(fill);
  card.appendChild(progress);
  card.appendChild(el('p', 'estado-vacio', 'Puedes cerrar la sesión o seguir practicando.'));
  zone.appendChild(card);
}
