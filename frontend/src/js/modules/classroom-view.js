import { el, clearChildren } from '../utils/dom-helpers.js';
import { createViewHeader, createField, createAlert } from '../utils/ui.js';
import { session } from './session.js';
import * as classes from '../services/classroom-service.js';

export function renderClassrooms(container) {
  clearChildren(container);
  container.appendChild(createViewHeader(session.isTeacher ? 'Salón de clase' : 'Mis clases', session.isTeacher ? 'Organiza tus grupos, comparte asignaciones y revisa entregas.' : 'Consulta tus asignaciones y entrega tus trabajos.'));
  const body = el('div'); body.id = 'classroomList'; container.appendChild(body);
  if (session.isTeacher) container.insertBefore(buildClassForm(loadClasses), body);
  loadClasses();
}

function buildClassForm(refresh) {
  const card = el('section', 'cajon'); card.appendChild(el('h3', '', 'Crear salón'));
  const form = el('form', 'formulario');
  const name = createField({ id: 'classroomName', label: 'Nombre del salón', required: true });
  const message = el('div'); const button = el('button', 'btn btn-primario', 'Crear salón'); button.type = 'submit';
  form.append(name.wrapper, message, button); card.appendChild(form);
  form.addEventListener('submit', async (event) => { event.preventDefault(); button.disabled = true; try { await classes.create({ name: name.input.value.trim() }); name.input.value = ''; message.replaceChildren(); refresh(); } catch (error) { message.replaceChildren(createAlert(error.message)); } finally { button.disabled = false; } });
  return card;
}

async function loadClasses() {
  const body = document.getElementById('classroomList'); if (!body) return;
  body.replaceChildren(el('p', 'estado-vacio', 'Cargando salones…'));
  try { const rows = await classes.list(); clearChildren(body); if (!rows.length) body.appendChild(el('p', 'estado-vacio', 'Todavía no hay salones.')); rows.forEach((item) => body.appendChild(session.isTeacher ? teacherClass(item) : studentClass(item))); }
  catch (error) { body.replaceChildren(createAlert(error.message)); }
}

function teacherClass(item) {
  const card = el('section', 'cajon'); const head = el('div', 'vista-acciones'); head.append(el('h3', '', item.name), el('span', 'badge badge-primario', `Código ${item.join_code}`), el('span', 'badge badge-verde', `${item.student_count} estudiantes`)); card.appendChild(head);
  const add = el('form', 'formulario'); const email = createField({ id: `email-${item.id}`, label: 'Correo del estudiante', type: 'email', required: true }); const msg = el('div'); const addButton = el('button', 'btn btn-contorno', 'Añadir estudiante'); addButton.type = 'submit'; add.append(email.wrapper, addButton, msg); card.appendChild(add);
  add.addEventListener('submit', async (event) => { event.preventDefault(); try { const result = await classes.addStudent(item.id, email.input.value.trim()); msg.replaceChildren(el('p', 'badge badge-verde', result.message || 'Estudiante añadido')); email.input.value = ''; loadClasses(); } catch (error) { msg.replaceChildren(createAlert(error.message)); } });
  const assign = el('form', 'formulario'); assign.appendChild(el('h4', '', 'Publicar asignación')); const title = createField({ id: `title-${item.id}`, label: 'Título', required: true }); const instructions = createField({ id: `instructions-${item.id}`, label: 'Instrucciones', type: 'textarea' }); const file = createField({ id: `file-${item.id}`, label: 'Archivo o foto', type: 'file' }); file.input.accept = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.webp'; const due = createField({ id: `due-${item.id}`, label: 'Fecha límite', type: 'date' }); const publish = el('button', 'btn btn-primario', 'Publicar'); publish.type = 'submit'; const notice = el('div'); assign.append(title.wrapper, instructions.wrapper, file.wrapper, due.wrapper, publish, notice); card.appendChild(assign);
  assign.addEventListener('submit', async (event) => { event.preventDefault(); const data = new FormData(); data.append('title', title.input.value.trim()); data.append('instructions', instructions.input.value); data.append('due_at', due.input.value); if (file.input.files[0]) data.append('file', file.input.files[0]); publish.disabled = true; try { await classes.createAssignment(item.id, data); notice.replaceChildren(el('p', 'badge badge-verde', 'Asignación publicada')); title.input.value = ''; instructions.input.value = ''; file.input.value = ''; } catch (error) { notice.replaceChildren(createAlert(error.message)); } finally { publish.disabled = false; } });
  (item.assignments || []).forEach((assignment) => card.appendChild(teacherAssignment(assignment)));
  return card;
}

function teacherAssignment(assignment) {
  const box = el('article', 'tarjeta'); box.appendChild(el('h4', '', assignment.title)); box.appendChild(el('p', '', `${assignment.submission_count || 0} entregas${assignment.due_at ? ` · Fecha límite: ${assignment.due_at}` : ''}`)); if (assignment.file_name) box.appendChild(fileLink(assignment.file_url, assignment.file_name));
  const button = el('button', 'btn btn-contorno', 'Revisar entregas'); box.appendChild(button); const list = el('div'); box.appendChild(list); button.addEventListener('click', async () => { button.disabled = true; try { const rows = await classes.submissions(assignment.id); list.replaceChildren(...(rows.length ? rows.map(submissionRow) : [el('p', 'estado-vacio', 'Aún no hay entregas.') ])); } catch (error) { list.replaceChildren(createAlert(error.message)); } finally { button.disabled = false; } }); return box;
}

function submissionRow(row) {
  const section = el('section', 'cajon'); section.appendChild(el('strong', '', row.student_name)); section.appendChild(fileLink(row.file_url, row.file_name)); section.appendChild(el('small', 'estado-vacio', `Entregado: ${row.submitted_at}`)); const form = el('form', 'formulario'); const grade = createField({ id: `grade-${row.id}`, label: 'Calificación (0–100)', type: 'number', required: true }); grade.input.min = '0'; grade.input.max = '100'; grade.input.value = row.grade ?? ''; const feedback = createField({ id: `feedback-${row.id}`, label: 'Comentario', type: 'textarea' }); feedback.input.value = row.feedback || ''; const submit = el('button', 'btn btn-primario', 'Guardar corrección'); submit.type = 'submit'; form.append(grade.wrapper, feedback.wrapper, submit); section.appendChild(form); form.addEventListener('submit', async (event) => { event.preventDefault(); try { await classes.grade(row.id, { grade: Number(grade.input.value), feedback: feedback.input.value }); submit.textContent = 'Guardado'; } catch (error) { form.appendChild(createAlert(error.message)); } }); return section;
}

function studentClass(item) { const card = el('section', 'cajon'); card.appendChild(el('h3', '', item.name)); (item.assignments || []).forEach((assignment) => { const box = el('article', 'tarjeta'); box.appendChild(el('h4', '', assignment.title)); if (assignment.instructions) box.appendChild(el('p', '', assignment.instructions)); if (assignment.file_name) box.appendChild(fileLink(assignment.file_url, assignment.file_name)); box.appendChild(el('p', 'estado-vacio', assignment.grade === null ? (assignment.submitted ? 'Entregada · pendiente de corrección' : 'Pendiente') : `Calificación: ${assignment.grade}/100${assignment.feedback ? ` · ${assignment.feedback}` : ''}`)); if (!assignment.submitted) { const form = el('form', 'formulario'); const upload = createField({ id: `submit-${assignment.id}`, label: 'Sube tu trabajo', type: 'file', required: true }); upload.input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.webp'; const button = el('button', 'btn btn-primario', 'Entregar asignación'); button.type = 'submit'; const msg = el('div'); form.append(upload.wrapper, button, msg); box.appendChild(form); form.addEventListener('submit', async (event) => { event.preventDefault(); const data = new FormData(); data.append('file', upload.input.files[0]); button.disabled = true; try { await classes.submit(assignment.id, data); msg.replaceChildren(el('p', 'badge badge-verde', 'Trabajo entregado')); loadClasses(); } catch (error) { msg.replaceChildren(createAlert(error.message)); button.disabled = false; } }); } card.appendChild(box); }); return card; }

function fileLink(url, name) { const a = el('a', '', `📎 ${name}`); a.href = url; a.target = '_blank'; a.rel = 'noopener'; return a; }
