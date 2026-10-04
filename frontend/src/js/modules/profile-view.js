import { el, clearChildren } from '../utils/dom-helpers.js';
import { createViewHeader, createAlert } from '../utils/ui.js';
import { formatDate, formatType, labelFor } from '../utils/formatters.js';
import * as assistant from '../services/assistant-service.js';
import * as lab from '../services/lab-service.js';
import * as calculator from '../services/calculator-service.js';
import { session } from './session.js';
import { renderProfileCustomization } from './profile-customization-view.js';
import { buildProfileAvatar } from '../utils/profile-identity.js';

export function renderProfile(container) {
  clearChildren(container);
  container.appendChild(createViewHeader('Mi perfil', 'Resumen de tu actividad en la plataforma.'));

  const intro = el('section', 'cajon');
  intro.appendChild(buildProfileAvatar(session.user));
  intro.appendChild(el('h3', '', session.user.full_name));
  intro.appendChild(el('p', '', session.user.email));
  intro.appendChild(el('span', 'badge badge-ambar', getRoleLabel(session.user.role)));
  if (session.isStudent) intro.appendChild(el('p', '', `⭐ ${session.user.points} puntos`));
  container.appendChild(intro);
  renderProfileCustomization(container);

  const statsGrid = el('div', 'stat-grid');
  statsGrid.id = 'statPerfil';
  container.appendChild(statsGrid);

  const historyCard = el('section', 'cajon');
  historyCard.appendChild(el('h3', '', 'Historial reciente'));
  const historyBody = el('div');
  historyBody.id = 'historialPerfil';
  historyCard.appendChild(historyBody);
  container.appendChild(historyCard);

  loadProfileData();
}

function getRoleLabel(role) {
  const labels = { docente: 'Docente', estudiante: 'Estudiante', administrador: 'Administrador' };
  return labels[role] || `Rol: ${role}`;
}

async function loadProfileData() {
  const statGrid = document.getElementById('statPerfil');
  const historyBody = document.getElementById('historialPerfil');
  if (!statGrid || !historyBody) {
    return;
  }

  try {
    const context = await assistant.getContextData();
    renderStats(statGrid, context);
  } catch {
    statGrid.replaceChildren(createAlert('No se pudieron cargar tus estadísticas.'));
  }

  try {
    const [experiments, operations] = await Promise.all([
      lab.listExperiments(),
      calculator.listOperations(),
    ]);
    renderHistory(historyBody, experiments.slice(0, 8), operations.slice(0, 8));
  } catch {
    historyBody.replaceChildren(createAlert('No se pudo cargar el historial.'));
  }
}

function renderStats(grid, context) {
  clearChildren(grid);
  const stats = [
    { value: context.calculations, label: 'Cálculos' },
    { value: context.samples, label: 'Muestras' },
    { value: context.experiments, label: 'Experimentos' },
    { value: context.reactions, label: 'Reacciones' },
    { value: context.quizzes, label: 'Exámenes' },
    ...(session.isStudent ? [{ value: context.points, label: 'Puntos' }] : []),
  ];
  for (const stat of stats) {
    const box = el('div', 'stat');
    box.appendChild(el('div', 'stat-valor', String(stat.value)));
    box.appendChild(el('div', 'stat-etiqueta', stat.label));
    grid.appendChild(box);
  }
}

function renderHistory(body, experiments, operations) {
  clearChildren(body);

  const experimentsTitle = el('h4', '', 'Experimentos');
  body.appendChild(experimentsTitle);
  body.appendChild(buildExperimentsTable(experiments));

  const operationsTitle = el('h4', '', 'Cálculos recientes');
  body.appendChild(operationsTitle);
  body.appendChild(buildOperationsTable(operations));
}

function buildExperimentsTable(experiments) {
  if (experiments.length === 0) {
    return el('p', 'estado-vacio', 'Sin experimentos todavía.');
  }
  const table = el('table', 'tabla');
  const thead = el('thead');
  const headerRow = el('tr');
  for (const column of ['Fecha', 'Tipo', 'Resultado', 'Puntos']) {
    headerRow.appendChild(el('th', '', column));
  }
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = el('tbody');
  for (const experiment of experiments) {
    const row = el('tr');
    row.appendChild(el('td', '', formatDate(experiment.created_at)));
    row.appendChild(el('td', '', formatType(experiment.experiment_type)));
    row.appendChild(el('td', '', experiment.result_summary));
    row.appendChild(el('td', '', String(experiment.points_awarded)));
    tbody.appendChild(row);
  }
  table.appendChild(tbody);
  return table;
}

function buildOperationsTable(operations) {
  if (operations.length === 0) {
    return el('p', 'estado-vacio', 'Sin cálculos todavía.');
  }
  const table = el('table', 'tabla');
  const thead = el('thead');
  const headerRow = el('tr');
  for (const column of ['Fecha', 'Expresión', 'Resultado', 'Tipo']) {
    headerRow.appendChild(el('th', '', column));
  }
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = el('tbody');
  for (const operation of operations) {
    const row = el('tr');
    row.appendChild(el('td', '', formatDate(operation.created_at)));
    row.appendChild(el('td', '', operation.expression));
    row.appendChild(el('td', '', operation.result));
    row.appendChild(el('td', '', labelFor(operation.operation_type)));
    tbody.appendChild(row);
  }
  table.appendChild(tbody);
  return table;
}
