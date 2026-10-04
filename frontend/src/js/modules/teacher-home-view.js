import { el, clearChildren } from '../utils/dom-helpers.js';
import { createAlert, createViewHeader } from '../utils/ui.js';
import * as classrooms from '../services/classroom-service.js';
import { navigate } from './router.js';

export function renderTeacherHome(container) {
  clearChildren(container);
  container.appendChild(createViewHeader('Inicio docente', 'Resumen de tus salones activos y su actividad.'));
  const summary = el('div', 'stat-grid');
  const list = el('div', 'rejilla');
  list.id = 'teacherActiveClasses';
  container.append(summary, list);
  loadActiveClasses(summary, list);
}

async function loadActiveClasses(summary, list) {
  list.replaceChildren(el('p', 'estado-vacio', 'Cargando tus salones…'));
  try {
    const rows = await classrooms.list();
    const assignmentCount = rows.reduce((total, row) => total + (row.assignments || []).length, 0);
    const studentCount = rows.reduce((total, row) => total + Number(row.student_count || 0), 0);
    summary.replaceChildren(
      stat(rows.length, 'Clases activas'),
      stat(studentCount, 'Estudiantes'),
      stat(assignmentCount, 'Asignaciones'),
    );
    clearChildren(list);
    if (!rows.length) {
      list.append(
        el('p', 'estado-vacio', 'Aún no tienes clases activas.'),
        action('Crear mi primer salón', '#/clases'),
      );
      return;
    }
    rows.forEach((classroom) => list.appendChild(classCard(classroom)));
  } catch (error) {
    summary.replaceChildren();
    list.replaceChildren(createAlert(error.message));
  }
}

function stat(value, label) {
  const item = el('div', 'stat');
  item.append(el('div', 'stat-valor', String(value)), el('div', 'stat-etiqueta', label));
  return item;
}

function classCard(classroom) {
  const card = el('article', 'tarjeta');
  card.append(
    el('span', 'badge badge-verde', 'Activa'),
    el('h3', '', classroom.name),
    el('p', '', `${classroom.student_count || 0} estudiantes`),
    el('p', '', `${(classroom.assignments || []).length} asignaciones`),
    el('p', '', `${(classroom.assignments || []).reduce((sum, assignment) => sum + Number(assignment.submission_count || 0), 0)} entregas recibidas`),
    action('Administrar salón', '#/clases'),
  );
  return card;
}

function action(label, hash) {
  const button = el('button', 'btn btn-primario', label);
  button.type = 'button';
  button.addEventListener('click', () => navigate(hash));
  return button;
}
