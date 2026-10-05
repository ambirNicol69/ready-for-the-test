import { getElement, clearChildren, el } from '../utils/dom-helpers.js';
import { emit } from '../utils/events.js';
import { session } from './session.js';
import { renderProfile } from './profile-view.js';
import { renderCalculator } from './calculator-view.js';
import { renderCatalog } from './catalog-view.js';
import { renderLaboratory } from './lab-hub-view.js';
import { renderQuiz } from './quiz-view.js';
import { renderLogin, renderRegister } from './auth-view.js';
import { renderClassrooms } from './classroom-view.js';
import { renderTeacherHome } from './teacher-home-view.js';
import { renderLessons } from './lessons-view.js';
import { renderWelcome } from './welcome-view.js';
import { renderMiniCalculatorGame } from './mini-calculator-game.js';
import { renderMinigamesHub } from './minigames-hub-view.js';
import { renderEquationGame } from './mini-equation-game.js';
import { renderConversionGame } from './mini-conversion-game.js';
import { renderInstrumentGame } from './mini-instrument-game.js';
import { renderSubstanceGame } from './mini-substance-game.js';
import { renderMixtureGame } from './mini-mixture-game.js';

const AUTHED_ROUTES = {
  '#/inicio': (container) => session.isTeacher ? renderTeacherHome(container) : renderWelcome(container),
  '#/perfil': renderProfile,
  '#/calculadora': renderCalculator,
  '#/laboratorio': (container) => renderLaboratory(container),
  '#/catalogo': renderCatalog,
  '#/identificacion': (container) => renderLaboratory(container, 'identificacion'),
  '#/salas': renderQuiz,
  '#/clases': renderClassrooms,
  '#/lecciones': renderLessons,
  '#/juegos/calculadora': renderMiniCalculatorGame,
  '#/juegos': renderMinigamesHub,
  '#/juegos/ecuacion': renderEquationGame,
  '#/juegos/conversiones': renderConversionGame,
  '#/juegos/instrumentos': renderInstrumentGame,
  '#/juegos/sustancias': renderSubstanceGame,
  '#/juegos/mezclas': renderMixtureGame,
};

const PUBLIC_ROUTES = {
  '#/login': renderLogin,
  '#/registro': renderRegister,
};

const CONTEXT_BY_ROUTE = {
  '#/inicio': 'inicio_docente',
  '#/perfil': 'perfil',
  '#/calculadora': 'calculadora',
  '#/laboratorio': 'laboratorio',
  '#/catalogo': 'catalogo',
  '#/identificacion': 'identificacion',
  '#/salas': 'salas',
  '#/clases': 'clases',
  '#/lecciones': 'lecciones',
  '#/juegos/calculadora': 'juegos',
  '#/juegos': 'juegos',
};

let profileOpenRequested = false;

export function currentHash() {
  return location.hash || '#/inicio';
}

export function navigate(hash) {
  profileOpenRequested = hash === '#/perfil';
  if (location.hash === hash) {
    handleRoute();
  } else {
    location.hash = hash;
  }
}

export function startRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

export function contextForRoute() {
  return CONTEXT_BY_ROUTE[currentHash()] || 'general';
}

function handleRoute() {
  const hash = currentHash();
  const container = getElement('app');
  if (hash === '#/mezclas') {
    location.hash = '#/laboratorio';
    return;
  }
  let view = AUTHED_ROUTES[hash];

  if (view && !session.isLogged && hash !== '#/inicio') {
    location.hash = '#/login';
    return;
  }

  if (session.isLogged && hash === '#/perfil' && !profileOpenRequested) {
    location.hash = '#/inicio';
    return;
  }
  if (hash === '#/perfil') profileOpenRequested = false;

  if (session.isLogged && !session.isTeacher && hash === '#/calculadora') {
    location.hash = '#/lecciones';
    return;
  }

  if (session.isTeacher && view && !['#/inicio', '#/salas', '#/clases', '#/perfil'].includes(hash)) {
    location.hash = '#/inicio';
    return;
  }

  if (!view) {
    view = PUBLIC_ROUTES[hash];
  }

  if (session.isLogged && (hash === '#/login' || hash === '#/registro')) {
    location.hash = '#/inicio';
    return;
  }

  clearChildren(container);
  container.classList.toggle('welcome-page', hash === '#/inicio' && !session.isTeacher);
  if (view) {
    view(container);
  } else {
    container.appendChild(el('p', 'estado-vacio', 'Ruta no encontrada'));
  }
  emit('route', { hash });
}
