import { el, clearChildren } from '../utils/dom-helpers.js';
import { createViewHeader, createAlert, createField, clearFieldError, setFieldError } from '../utils/ui.js';
import { showToast } from '../utils/toast.js';
import { isRequired, isInRange } from '../utils/validators.js';
import * as quiz from '../services/quiz-service.js';
import { buildAutoCreator } from './quiz-auto-creator.js';
import { createLiveHostPanel } from './quiz-live-teacher-view.js';

const LETTERS = ['A', 'B', 'C', 'D'];
const MIN_QUESTIONS = 1;
const MAX_QUESTIONS = 20;
const OPTION_POSITIONS = [1, 2, 3, 4];

export function renderQuizTeacher(container) {
  container.appendChild(createViewHeader(
    'Salas de examen',
    'Crea salas con preguntas y códigos para tus estudiantes.'
  ));

  const listCard = el('section', 'cajon');
  listCard.appendChild(el('h3', '', 'Mis salas'));
  const listBody = el('div');
  listBody.id = 'listaSalasDocente';
  listCard.appendChild(listBody);
  container.appendChild(listCard);

  const createCard = el('section', 'cajon');
  createCard.appendChild(el('h3', '', 'Crear sala'));
  createCard.appendChild(buildCreator());
  container.appendChild(createCard);

  const autoCard = el('section', 'cajon');
  autoCard.appendChild(el('h3', '', 'Crear sala automática con IA'));
  autoCard.appendChild(buildAutoCreator(loadTeacherRooms));
  container.appendChild(autoCard);

  loadTeacherRooms();
}

function buildCreator() {
  const form = el('form', 'formulario');
  const titleField = createField({ id: 'salaTitulo', label: 'Título de la sala', required: true });
  titleField.input.maxLength = 120;

  const questionsBox = el('div');
  questionsBox.id = 'preguntasCajon';
  questionsBox.classList.add('estante');

  const addQuestionButton = el('button', 'btn btn-contorno', '+ Agregar pregunta');
  addQuestionButton.type = 'button';
  const messageBox = el('div');
  const submit = el('button', 'btn btn-primario', 'Crear sala');
  submit.type = 'submit';

  form.appendChild(titleField.wrapper);
  form.appendChild(el('p', '', 'Preguntas'));
  form.appendChild(questionsBox);
  form.appendChild(addQuestionButton);
  form.appendChild(messageBox);
  form.appendChild(submit);

  addQuestionButton.addEventListener('click', () => appendQuestionBlock(questionsBox));
  appendQuestionBlock(questionsBox);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearChildren(messageBox);
    clearFieldError(titleField);

    const questions = collectQuestions(questionsBox);
    const titleOk = isRequired(titleField.input.value);
    if (!titleOk) {
      setFieldError(titleField, 'Escribe un título');
    }
    if (!titleOk || !questions.valid) {
      if (!questions.valid) {
        messageBox.appendChild(createAlert(
          questions.countMessage || 'Revisa las preguntas: texto y opciones obligatorios, puntos de 1 a 100.'
        ));
      }
      return;
    }

    submit.disabled = true;
    try {
      await quiz.createRoom({ title: titleField.input.value.trim(), questions: questions.data });
      showToast('Sala creada');
      titleField.input.value = '';
      resetQuestions(questionsBox);
      loadTeacherRooms();
    } catch (error) {
      messageBox.appendChild(createAlert(error.message));
    } finally {
      submit.disabled = false;
    }
  });

  return form;
}

function appendQuestionBlock(box) {
  const block = el('div', 'cajon pregunta-item');
  block.appendChild(el('p', '', `Pregunta ${box.children.length + 1}`));

  const textField = createField({
    id: `pregTexto${box.children.length + 1}`, label: 'Texto de la pregunta', required: true,
  });
  textField.input.classList.add('campo-pregunta');
  textField.input.maxLength = 255;
  block.appendChild(textField.wrapper);

  for (const position of OPTION_POSITIONS) {
    const field = createField({
      id: `pregOpcion${box.children.length + 1}_${position}`,
      label: `Opción ${LETTERS[position - 1]}`,
      required: true,
    });
    field.input.classList.add('campo-opcion');
    field.input.maxLength = 120;
    block.appendChild(field.wrapper);
  }

  const correctField = createField({
    id: `pregCorrecta${box.children.length + 1}`,
    label: 'Opción correcta',
    type: 'select',
    options: OPTION_POSITIONS.map((value) => ({ value: String(value), text: LETTERS[value - 1] })),
  });
  correctField.input.classList.add('campo-correcta');
  block.appendChild(correctField.wrapper);

  const pointsField = createField({
    id: `pregPuntos${box.children.length + 1}`,
    label: 'Puntos (1 a 100)',
    type: 'number',
    required: true,
  });
  pointsField.input.classList.add('campo-puntos');
  pointsField.input.value = '10';
  block.appendChild(pointsField.wrapper);

  const removeButton = el('button', 'btn btn-peligro', 'Quitar pregunta');
  removeButton.type = 'button';
  removeButton.addEventListener('click', () => {
    block.remove();
    renumberBlocks(box);
  });
  block.appendChild(removeButton);

  box.appendChild(block);
}

function collectQuestions(box) {
  const blocks = box.querySelectorAll('.pregunta-item');
  const count = blocks.length;
  if (count < MIN_QUESTIONS || count > MAX_QUESTIONS) {
    return { valid: false, data: [], countMessage: 'La sala debe tener entre 1 y 20 preguntas' };
  }

  const questions = [];
  let valid = true;

  for (const block of blocks) {
    const text = block.querySelector('.campo-pregunta').value.trim();
    const options = [...block.querySelectorAll('.campo-opcion')].map((input) => input.value.trim());
    const correctOption = Number(block.querySelector('.campo-correcta').value);
    const pointsValue = Number(block.querySelector('.campo-puntos').value);

    const textOk = isRequired(text);
    const optionsOk = options.length === 4 && options.every(isRequired);
    const pointsOk = isInRange(pointsValue, 1, 100);
    const correctOk = correctOption >= 1 && correctOption <= 4;

    if (!textOk || !optionsOk || !pointsOk || !correctOk) {
      valid = false;
    } else {
      questions.push({ question_text: text, options, correct_option: correctOption, points_value: pointsValue });
    }
  }

  return { valid, data: questions, countMessage: null };
}

function renumberBlocks(box) {
  box.querySelectorAll('.pregunta-item').forEach((block, index) => {
    block.querySelector('p').textContent = `Pregunta ${index + 1}`;
  });
}

function resetQuestions(box) {
  clearChildren(box);
  appendQuestionBlock(box);
}

async function loadTeacherRooms() {
  const listBody = document.getElementById('listaSalasDocente');
  if (!listBody) {
    return;
  }
  listBody.replaceChildren(el('p', 'estado-vacio', 'Cargando salas…'));
  try {
    const rooms = await quiz.listRooms();
    renderRoomList(listBody, rooms);
  } catch (error) {
    listBody.replaceChildren(createAlert(error.message));
  }
}

function renderRoomList(listBody, rooms) {
  clearChildren(listBody);
  if (rooms.length === 0) {
    listBody.appendChild(el('p', 'estado-vacio', 'Todavía no has creado salas.'));
    return;
  }
  for (const room of rooms) {
    listBody.appendChild(buildRoomRow(room));
  }
}

function buildRoomRow(room) {
  const card = el('article', 'tarjeta');
  const badges = el('div', 'vista-acciones');
  badges.appendChild(el('span', 'badge badge-primario', room.code));
  badges.appendChild(el('span', 'badge badge-verde', room.status));
  card.appendChild(badges);
  card.appendChild(el('h3', '', room.title));
  card.appendChild(el('p', '', `Creada: ${room.created_at}`));

  const actions = el('div', 'vista-acciones');
  const detailsButton = el('button', 'btn btn-contorno', 'Ver preguntas');
  detailsButton.addEventListener('click', () => toggleRoomDetails(card, room.id, detailsButton));
  const liveButton = el('button', 'btn btn-ambar', 'Competencia en vivo');
  let livePanel = null;
  liveButton.addEventListener('click', () => {
    if (livePanel) {
      livePanel.dispose(); livePanel.element.remove(); livePanel = null;
      liveButton.textContent = 'Competencia en vivo';
      return;
    }
    livePanel = createLiveHostPanel(room);
    card.appendChild(livePanel.element);
    liveButton.textContent = 'Cerrar panel en vivo';
  });
  const deleteButton = el('button', 'btn btn-peligro', 'Eliminar');
  deleteButton.addEventListener('click', () => deleteRoomRow(room.id));
  actions.appendChild(detailsButton);
  actions.appendChild(liveButton);
  actions.appendChild(deleteButton);
  card.appendChild(actions);
  return card;
}

async function deleteRoomRow(roomId) {
  try {
    await quiz.deleteRoom(roomId);
    showToast('Sala eliminada');
    loadTeacherRooms();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function toggleRoomDetails(card, roomId, button) {
  const existing = card.querySelector('.detalle-sala');
  if (existing) {
    existing.remove();
    button.textContent = 'Ver preguntas';
    return;
  }
  button.textContent = 'Ocultar preguntas';
  const detail = el('div', 'detalle-sala');
  detail.appendChild(el('p', 'estado-vacio', 'Cargando…'));
  card.appendChild(detail);
  try {
    const data = await quiz.getRoom(roomId);
    renderRoomDetails(detail, data.questions);
  } catch (error) {
    detail.replaceChildren(createAlert(error.message));
  }
}

function renderRoomDetails(detail, questions) {
  clearChildren(detail);
  for (const question of questions) {
    const questionBox = el('div', 'cajon');
    questionBox.appendChild(el('p', '', `❓ ${question.question_text} · ${question.points_value} pts`));
    for (const option of question.options) {
      const marker = option.position === question.correct_option ? '✅' : LETTERS[option.position - 1];
      questionBox.appendChild(el('p', 'estado-vacio', `${marker} ${option.text}`));
    }
    detail.appendChild(questionBox);
  }
}
