import { el, clearChildren } from '../utils/dom-helpers.js';
import { session } from './session.js';
import { navigate } from './router.js';

const HERO_IMAGES = [
  'hero-students-1.jpg',
  'hero-students-2.jpg',
  'hero-students-3.jpg',
];
const SLIDE_INTERVAL = 6500;
let slideTimer = null;

export function renderWelcome(container) {
  clearChildren(container);
  const isLoggedIn = session.isLogged;
  const page = el('div', 'welcome-landing');
  page.appendChild(renderHero(isLoggedIn));
  page.append(renderSubjects(), renderTools());
  container.appendChild(page);
}

function renderHero(isLoggedIn) {
  const hero = el('section', 'welcome-hero');
  hero.id = 'inicio';
  hero.setAttribute('aria-labelledby', 'welcomeTitle');

  const slides = el('div', 'welcome-slides');
  slides.setAttribute('aria-hidden', 'true');
  const images = HERO_IMAGES.map((filename, index) => {
    const image = el('img', `welcome-slide${index === 0 ? ' is-active' : ''}`);
    image.src = new URL(`../../assets/images/${filename}`, import.meta.url).href;
    image.alt = '';
    image.addEventListener('load', () => image.classList.add('is-loaded'));
    image.addEventListener('error', () => image.classList.add('is-unavailable'));
    slides.appendChild(image);
    return image;
  });
  hero.appendChild(slides);

  const content = el('div', 'welcome-hero-content');
  const copy = el('div', 'welcome-copy');
  copy.appendChild(el('p', 'welcome-eyebrow', 'Ready4TheTest? · Aprende haciendo'));
  copy.appendChild(el('h1', '', isLoggedIn ? 'Aprende hoy. Llega preparado.' : 'Comprende. Practica. Llega listo.'));
  copy.lastElementChild.id = 'welcomeTitle';
  copy.appendChild(el('p', 'welcome-lead', 'Explora Matemáticas, Física y Química con lecciones guiadas, retos interactivos y herramientas para experimentar.'));

  const actions = el('div', 'welcome-actions');
  actions.append(
    action(isLoggedIn ? 'Explorar lecciones' : 'Comenzar ahora', isLoggedIn ? '#/lecciones' : '#/registro', 'btn btn-primario welcome-primary-action'),
    action(isLoggedIn ? 'Probar minijuegos' : 'Ya tengo una cuenta', isLoggedIn ? '#/juegos' : '#/login', 'btn btn-contorno welcome-secondary-action'),
  );
  copy.appendChild(actions);
  content.appendChild(copy);
  content.appendChild(renderSubjectShowcase());
  hero.appendChild(content);

  const controls = renderCarouselControls(images);
  controls.hidden = true;
  let loadedImageCount = 0;
  images.forEach((image) => image.addEventListener('load', () => {
    loadedImageCount += 1;
    if (loadedImageCount > 1) controls.hidden = false;
  }, { once: true }));
  hero.appendChild(controls);
  startSlideshow(images, controls);
  return hero;
}

function renderSubjectShowcase() {
  const panel = el('aside', 'welcome-showcase');
  panel.setAttribute('aria-label', 'Materias disponibles');
  panel.appendChild(el('p', 'welcome-showcase-title', 'Tres materias. Un mismo espacio.'));
  [
    { symbol: '∑', name: 'Matemáticas', detail: 'Resuelve paso a paso', theme: 'matematicas' },
    { symbol: 'F = ma', name: 'Física', detail: 'Entiende las fuerzas', theme: 'fisica' },
    { symbol: 'pH', name: 'Química', detail: 'Explora la materia', theme: 'quimica' },
  ].forEach((subject) => {
    const item = el('div', `welcome-subject welcome-subject-${subject.theme}`);
    item.append(el('span', 'welcome-subject-symbol', subject.symbol), el('span', 'welcome-subject-name', subject.name), el('span', 'welcome-subject-detail', subject.detail));
    panel.appendChild(item);
  });
  return panel;
}

function renderCarouselControls(images) {
  const controls = el('div', 'welcome-carousel-controls');
  controls.setAttribute('aria-label', 'Controles de imágenes de portada');
  const previous = controlButton('Imagen anterior', '‹');
  const toggle = controlButton('Pausar cambio de imágenes', 'Pausar');
  const next = controlButton('Imagen siguiente', '›');
  previous.addEventListener('click', () => showSlide(images, -1));
  next.addEventListener('click', () => showSlide(images, 1));
  toggle.setAttribute('aria-pressed', 'false');
  toggle.addEventListener('click', () => {
    const paused = toggle.getAttribute('aria-pressed') !== 'true';
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', paused ? 'Reanudar cambio de imágenes' : 'Pausar cambio de imágenes');
    toggle.textContent = paused ? 'Reanudar' : 'Pausar';
    if (paused) stopSlideshow();
    else startSlideshow(images, controls, true);
  });
  controls.append(previous, toggle, next);
  controls._toggle = toggle;
  return controls;
}

function startSlideshow(images, controls, userRequestedMotion = false) {
  stopSlideshow();
  if (!userRequestedMotion && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    controls._toggle.setAttribute('aria-pressed', 'true');
    controls._toggle.textContent = 'Reanudar';
    controls._toggle.setAttribute('aria-label', 'Reanudar cambio de imágenes');
    return;
  }
  slideTimer = window.setInterval(() => showSlide(images, 1), SLIDE_INTERVAL);
}

function stopSlideshow() {
  if (slideTimer) window.clearInterval(slideTimer);
  slideTimer = null;
}

function showSlide(images, direction) {
  const available = images.filter((image) => image.classList.contains('is-loaded'));
  if (available.length < 2) return;
  const activeIndex = available.findIndex((image) => image.classList.contains('is-active'));
  const nextIndex = (activeIndex + direction + available.length) % available.length;
  available.forEach((image, index) => image.classList.toggle('is-active', index === nextIndex));
}

function renderSubjects() {
  const section = el('section', 'welcome-section welcome-subjects-section');
  section.id = 'inicio-materias';
  section.setAttribute('aria-labelledby', 'welcomeSubjectsTitle');
  const heading = el('div', 'welcome-section-heading');
  heading.append(el('p', 'welcome-eyebrow', 'Empieza por una idea'), el('h2', '', '¿Qué quieres descubrir hoy?'));
  heading.lastElementChild.id = 'welcomeSubjectsTitle';
  section.appendChild(heading);
  const grid = el('div', 'welcome-subject-grid');
  [
    { key: 'matematicas', title: 'Matemáticas', description: 'Practica operaciones, funciones y resolución de problemas.', symbol: '∑' },
    { key: 'fisica', title: 'Física', description: 'Conecta fórmulas con movimiento, energía y fenómenos reales.', symbol: 'F = ma' },
    { key: 'quimica', title: 'Química', description: 'Investiga sustancias, reacciones y cambios de la materia.', symbol: 'pH' },
  ].forEach((subject) => {
    const card = el('article', `welcome-subject-card welcome-subject-card-${subject.key}`);
    card.append(el('span', 'welcome-card-symbol', subject.symbol), el('h3', '', subject.title), el('p', '', subject.description));
    card.appendChild(action('Ver recursos', '#/lecciones', 'welcome-text-action'));
    grid.appendChild(card);
  });
  section.appendChild(grid);
  return section;
}

function renderTools() {
  const section = el('section', 'welcome-section welcome-tools-section');
  section.id = 'inicio-recursos';
  section.setAttribute('aria-labelledby', 'welcomeToolsTitle');
  section.append(
    el('div', 'welcome-tools-mark', '∑  ·  F = ma  ·  pH'),
    el('div', 'welcome-tools-copy'),
  );
  const copy = section.lastElementChild;
  copy.append(el('p', 'welcome-eyebrow', 'Aprendizaje práctico'), el('h2', '', 'De la teoría a la práctica, a tu ritmo.'), el('p', '', 'Avanza con explicaciones guiadas, ejercita lo aprendido y explora el laboratorio y los minijuegos.'));
  copy.lastElementChild.previousElementSibling.id = 'welcomeToolsTitle';
  copy.appendChild(action('Explorar la plataforma', session.isLogged ? '#/laboratorio' : '#/registro', 'btn btn-primario'));
  return section;
}

function action(label, hash, className) {
  const link = el('a', className, label);
  link.href = hash;
  return link;
}

function controlButton(label, text) {
  const button = el('button', 'welcome-carousel-button', text);
  button.type = 'button';
  button.setAttribute('aria-label', label);
  return button;
}
