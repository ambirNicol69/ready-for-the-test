import { randomItem, makeQuestion } from './mini-game-content.js';
import { renderMiniQuizGame } from './mini-quiz-game.js';

const INSTRUMENTS = [
  { name: 'Balanza', task: 'medir la masa de una muestra' },
  { name: 'Dinamómetro', task: 'medir la fuerza que ejerce un objeto' },
  { name: 'Termómetro', task: 'medir la temperatura de un líquido' },
  { name: 'Cronómetro', task: 'medir cuánto dura una caída' },
  { name: 'Probeta graduada', task: 'medir el volumen de un líquido' },
  { name: 'Regla', task: 'medir la longitud de una barra pequeña' },
];

const CONFIG = {
  gameCode: 'instrumento-fisica',
  title: '¿Qué instrumento usarías?',
  description: 'Relaciona cada medición de física con el instrumento adecuado.',
  createQuestion,
};

export function renderInstrumentGame(container) {
  renderMiniQuizGame(container, CONFIG);
}

function createQuestion() {
  const instrument = randomItem(INSTRUMENTS);
  const alternatives = INSTRUMENTS
    .filter((item) => item.name !== instrument.name)
    .map((item) => item.name);
  return makeQuestion(`¿Qué instrumento usarías para ${instrument.task}?`, instrument.name, alternatives);
}
