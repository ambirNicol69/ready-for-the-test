import { getElement, el, clearChildren } from '../utils/dom-helpers.js';
import { on } from '../utils/events.js';
import { session } from './session.js';
import { navigate, currentHash } from './router.js';
import {
  applyAccentColor, buildProfileAvatar, readCustomization, saveLocalCustomization,
} from '../utils/profile-identity.js';
import { getCustomization } from '../services/profile-service.js';

const THEME_KEY = 'rft_tema';
const NAV_ITEMS = [
  { hash: '#/lecciones', label: 'Lecciones' },
  { hash: '#/juegos', label: 'Minijuegos' },
  { hash: '#/laboratorio', label: 'Laboratorio' },
  { hash: '#/catalogo', label: 'Catálogo' },
  { hash: '#/salas', label: 'Salas' },
  { hash: '#/clases', label: 'Salón de clase' },
];

let isRendered = false;
let customizationLoadId = null;

export function renderShell() {
  isRendered = true;
  on('session', refreshHeaderUi);
  on('route', ({ hash }) => markActiveRoute(hash));
  applyPersistedTheme();
  refreshHeaderUi();
}

function refreshHeaderUi() {
  if (!isRendered) {
    return;
  }
  const header = getElement('appHeader');
  if (session.user) {
    applyAccentColor(readCustomization(session.user.id).accent_color);
    loadHeaderCustomization(session.user.id);
  } else {
    customizationLoadId = null;
  }
  header.replaceChildren(buildHeader());
}

function loadHeaderCustomization(userId) {
  if (customizationLoadId === userId) return;
  customizationLoadId = userId;
  getCustomization().then((settings) => {
    if (session.user?.id !== userId) return;
    saveLocalCustomization(userId, settings);
    applyAccentColor(settings.accent_color);
    getElement('appHeader').replaceChildren(buildHeader());
  }).catch(() => {});
}

function buildHeader() {
  const header = el('header', 'app-header');

  const brand = el('a', 'app-brand');
  brand.href = '#/inicio';
  const logo = el('img', 'app-brand-logo');
  logo.src = new URL('../../assets/images/logocontitulo.jpeg', import.meta.url).href;
  logo.alt = 'Ready for the Test?';
  brand.appendChild(logo);

  const nav = el('nav', 'app-nav');
  if (session.isLogged) {
    const items = session.isTeacher
      ? [
        { hash: '#/inicio', label: 'Inicio' },
        { hash: '#/salas', label: 'Crear sala' },
        { hash: '#/clases', label: 'Salón de clase' },
      ]
      : session.isStudent ? [
        ...NAV_ITEMS.filter((item) => item.hash !== '#/clases'),
        { hash: '#/clases', label: 'Mis clases' },
      ] : [];
    for (const item of items) {
      nav.appendChild(buildNavLink(item));
    }
  }

  const right = el('div', 'app-header-derecha');
  right.appendChild(buildThemeButton());
  if (session.isLogged) {
    if (session.isStudent) {
      right.appendChild(buildScorePill());
    }
    right.appendChild(buildSessionPill());
    right.appendChild(buildLogoutButton());
  } else {
    right.appendChild(buildLinkButton('Ingresar', '#/login', 'btn btn-primario'));
    right.appendChild(buildLinkButton('Registrarse', '#/registro', 'btn btn-contorno'));
  }

  header.appendChild(brand);
  header.appendChild(nav);
  header.appendChild(right);
  return header;
}

function buildNavLink(item) {
  const link = el('button', `nav-link${item.hash === currentHash() ? ' is-active' : ''}`, item.label);
  link.setAttribute('data-ruta', item.hash);
  link.addEventListener('click', () => navigate(item.hash));
  return link;
}

function buildThemeButton() {
  const button = el('button', 'btn btn-icono', document.body.classList.contains('tema-oscuro') ? '☀️' : '🌙');
  button.setAttribute('aria-label', 'Cambiar tema');
  button.addEventListener('click', toggleTheme);
  return button;
}

function buildScorePill() {
  const pill = el('span', 'score-pill');
  pill.appendChild(el('span', '', '⭐'));
  pill.appendChild(el('strong', '', String(session.user.points)));
  pill.appendChild(el('span', '', 'puntos'));
  return pill;
}

function buildSessionPill() {
  const pill = el('button', 'session-pill');
  pill.type = 'button';
  pill.title = 'Abrir mi perfil';
  pill.addEventListener('click', () => navigate('#/perfil'));
  pill.appendChild(buildProfileAvatar(session.user, 'profile-avatar profile-avatar-header'));
  pill.appendChild(el('span', '', session.user.full_name.split(' ')[0]));
  return pill;
}

function buildLogoutButton() {
  const button = el('button', 'btn btn-icono', '⎋');
  button.title = 'Cerrar sesión';
  button.setAttribute('aria-label', 'Cerrar sesión');
  button.addEventListener('click', () => {
    session.logout();
    navigate('#/login');
  });
  return button;
}

function buildLinkButton(label, hash, className) {
  const link = el('a', className, label);
  link.href = hash;
  return link;
}

function markActiveRoute(hash) {
  const links = document.querySelectorAll('.nav-link');
  for (const link of links) {
    const route = link.getAttribute('data-ruta');
    const isGameRoute = route === '#/juegos' && hash.startsWith('#/juegos/');
    link.classList.toggle('is-active', route === hash || isGameRoute);
  }
}

function toggleTheme() {
  const isDark = document.body.classList.toggle('tema-oscuro');
  localStorage.setItem(THEME_KEY, isDark ? 'oscuro' : 'claro');
  refreshHeaderUi();
}

function applyPersistedTheme() {
  if (localStorage.getItem(THEME_KEY) === 'oscuro') {
    document.body.classList.add('tema-oscuro');
  }
}

export function refreshHeader() {
  refreshHeaderUi();
}
