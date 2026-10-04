import { el, clearChildren } from '../utils/dom-helpers.js';
import { createAlert, createViewHeader } from '../utils/ui.js';
import { session } from './session.js';
import { renderQuizTeacher } from './quiz-teacher-view.js';
import { renderQuizStudent } from './quiz-student-view.js';

export function renderQuiz(container) {
  clearChildren(container);
  if (session.isTeacher) {
    renderQuizTeacher(container);
  } else if (session.isStudent) {
    renderQuizStudent(container);
  } else {
    container.appendChild(createViewHeader('Salas de quiz', 'Tu cuenta no tiene un rol habilitado para participar.'));
    const role = session.user?.role || 'desconocido';
    container.appendChild(createAlert(`El servidor reconoce tu cuenta con el rol “${role}”. Se requiere el rol “estudiante”.`));
  }
}
