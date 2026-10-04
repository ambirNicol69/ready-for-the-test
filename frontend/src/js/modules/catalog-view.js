import { el, clearChildren } from '../utils/dom-helpers.js';
import { createViewHeader, createAlert } from '../utils/ui.js';
import { formatState, labelFor } from '../utils/formatters.js';
import * as lab from '../services/lab-service.js';
import { MATH_TOPICS } from './math-catalog.js';
import { LESSONS } from './lesson-catalog.js';

const SUBJECTS = [
  { key: 'quimica', label: 'Química' },
  { key: 'fisica', label: 'Física' },
  { key: 'matematicas', label: 'Matemáticas' },
];

const CHEMISTRY_SECTIONS = [
  { key: 'sustancias', label: 'Sustancias', loader: () => lab.listKnownSubstances() },
  { key: 'reactivos', label: 'Reactivos', loader: () => lab.listReagents() },
  { key: 'reacciones', label: 'Reacciones', loader: () => lab.listReactions() },
];

export function renderCatalog(container) {
  clearChildren(container);
  container.appendChild(createViewHeader('Catálogo de términos', 'Explora conceptos organizados por materia.'));
  const subjectNav = el('nav', 'vista-acciones');
  subjectNav.setAttribute('aria-label', 'Materias');
  const content = el('section');
  container.append(subjectNav, content);

  SUBJECTS.forEach((subject, index) => {
    const button = el('button', 'chip', subject.label);
    button.type = 'button';
    button.addEventListener('click', () => selectSubject(subject, button));
    subjectNav.appendChild(button);
    if (index === 0) selectSubject(subject, button);
  });

  function selectSubject(subject, button) {
    subjectNav.querySelectorAll('.chip').forEach((item) => {
      item.classList.toggle('is-activo', item === button);
    });
    if (subject.key === 'quimica') renderChemistry(content);
    if (subject.key === 'fisica') renderPhysics(content);
    if (subject.key === 'matematicas') renderMath(content);
  }
}

function renderChemistry(content) {
  const nav = el('nav', 'vista-acciones');
  nav.setAttribute('aria-label', 'Términos de química');
  const panel = el('section');
  content.replaceChildren(nav, panel);
  CHEMISTRY_SECTIONS.forEach((section, index) => {
    const button = el('button', 'chip', section.label);
    button.type = 'button';
    button.addEventListener('click', () => loadChemistrySection(section, button, nav, panel));
    nav.appendChild(button);
    if (index === 0) loadChemistrySection(section, button, nav, panel);
  });
}

async function loadChemistrySection(section, button, nav, panel) {
  nav.querySelectorAll('.chip').forEach((item) => item.classList.toggle('is-activo', item === button));
  panel.replaceChildren(el('p', 'estado-vacio', 'Cargando términos…'));
  try {
    const items = await section.loader();
    panel.replaceChildren(renderCards(section.key, items));
  } catch (error) {
    panel.replaceChildren(createAlert(error.message));
  }
}

function renderPhysics(content) {
  const lesson = LESSONS.find((item) => item.subject === 'Física');
  const cards = (lesson?.concepts || []).map((concept) => ({ name: concept.title, description: concept.text }));
  content.replaceChildren(renderCards('conceptos', cards, 'Conceptos clave de Física'));
}

function renderMath(content) {
  const grid = el('div', 'rejilla lista-horizontal');
  MATH_TOPICS.forEach((topic) => grid.appendChild(buildMathCard(topic)));
  content.replaceChildren(el('p', 'estado-vacio', 'Fórmulas y conceptos de Matemáticas.'), grid);
}

function renderCards(key, items, description = '') {
  const panel = el('div');
  if (description) panel.appendChild(el('p', 'estado-vacio', description));
  if (!items.length) {
    panel.appendChild(el('p', 'estado-vacio', 'No hay términos disponibles.'));
    return panel;
  }
  const grid = el('div', 'rejilla lista-horizontal');
  items.forEach((item) => grid.appendChild(buildCard(key, item)));
  panel.appendChild(grid);
  return panel;
}

function buildCard(key, item) {
  const card = el('article', 'tarjeta');
  if (key === 'sustancias') {
    card.append(el('div', 'tarjeta-icono', '🧪'), el('h3', '', item.name));
    card.append(el('p', 'estado-vacio', item.description));
    card.append(el('p', '', `Estado: ${formatState(item.state)} · ${labelFor(item.transparency)} · ${labelFor(item.conductivity)}`));
    card.append(el('span', 'badge badge-primario', `ρ ${item.density} g/mL`));
    card.append(el('p', 'estado-vacio', item.detail));
  } else if (key === 'reactivos') {
    const dot = el('span', 'vial-muestra');
    dot.style.setProperty('--vial-color', item.color_hex);
    card.append(dot, el('h3', '', `${item.icon} ${item.name}`));
    card.append(el('p', 'estado-vacio', item.description));
    card.append(el('span', 'badge badge-ambar', item.id));
  } else if (key === 'reacciones') {
    card.append(el('div', 'tarjeta-icono', '⚗️'), el('h3', '', item.result_name));
    card.append(el('p', '', `${item.reagent_a_id} + ${item.reagent_b_id}`));
    card.append(el('p', '', item.description));
    card.append(el('span', 'badge badge-verde', labelFor(item.effect)));
  } else {
    card.append(el('div', 'tarjeta-icono', '⚛️'), el('h3', '', item.name));
    card.append(el('p', 'estado-vacio', item.description));
  }
  return card;
}

function buildMathCard(topic) {
  const card = el('article', 'tarjeta');
  card.append(el('div', 'tarjeta-icono', topic.icon), el('h3', '', topic.title));
  card.appendChild(el('span', 'badge badge-primario', topic.badge));
  topic.items.forEach((term) => {
    const item = el('div', 'cajon');
    item.append(el('p', '', term.name), el('p', 'estado-vacio', term.formula));
    item.appendChild(el('p', 'estado-vacio', term.note));
    card.appendChild(item);
  });
  return card;
}
