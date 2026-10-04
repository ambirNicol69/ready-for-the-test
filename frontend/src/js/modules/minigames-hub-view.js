import { clearChildren, el } from '../utils/dom-helpers.js';

const SUBJECTS = [
  {
    name: 'Matemáticas',
    games: [
      ['Reto Calculadora', 'Resuelve operaciones con la calculadora integrada.', '#/juegos/calculadora'],
      ['Ordena la ecuación', 'Despeja x y observa cómo se transforma cada ecuación paso a paso.', '#/juegos/ecuacion'],
    ],
  },
  {
    name: 'Física',
    games: [
      ['Carrera de conversiones', 'Responde conversiones y avanza por la pista hasta la meta.', '#/juegos/conversiones'],
      ['¿Qué instrumento usarías?', 'Elige el instrumento adecuado para cada medición.', '#/juegos/instrumentos'],
    ],
  },
  {
    name: 'Química',
    games: [
      ['Sustancia misteriosa', 'Identifica materiales según sus propiedades.', '#/juegos/sustancias'],
      ['Mezcla segura', 'Predice reacciones en el laboratorio virtual.', '#/juegos/mezclas'],
    ],
  },
];

export function renderMinigamesHub(container) {
  clearChildren(container);
  const heading = el('header', 'vista-cabecera');
  heading.append(el('h2', '', 'Minijuegos'));
  heading.append(el('p', '', 'Practica Matemáticas, Física y Química. Cada partida guarda tus puntos y tu tiempo.'));
  container.append(heading);

  const hub = el('div', 'minigames-hub');
  SUBJECTS.forEach((subject) => hub.append(buildSubjectSection(subject)));
  container.append(hub);
}

function buildSubjectSection(subject) {
  const section = el('section', 'minigame-subject');
  section.append(el('h3', '', subject.name));
  const cards = el('div', 'minigame-cards');
  subject.games.forEach((game) => cards.append(buildGameCard(game, subject.name)));
  section.append(cards);
  return section;
}

function buildGameCard(game, subjectName) {
  const card = el('article', 'minigame-card');
  card.append(el('span', 'minigame-subject-tag', subjectName));
  card.append(el('h4', '', game[0]));
  card.append(el('p', '', game[1]));
  const button = el('button', 'btn btn-primario', 'Jugar');
  button.type = 'button';
  button.addEventListener('click', () => { location.hash = game[2]; });
  card.append(button);
  return card;
}
