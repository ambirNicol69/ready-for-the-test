import { randomItem, makeQuestion } from './mini-game-content.js';
import { renderMiniQuizGame } from './mini-quiz-game.js';

const SUBSTANCES = [
  { name: 'Agua', state: 'líquido', transparency: 'transparente', conductivity: 'no conduce', density: 1 },
  { name: 'Alcohol etílico', state: 'líquido', transparency: 'transparente', conductivity: 'no conduce', density: 0.79 },
  { name: 'Agua salada', state: 'líquido', transparency: 'transparente', conductivity: 'conduce', density: 1.03 },
  { name: 'Aceite vegetal', state: 'líquido', transparency: 'opaco', conductivity: 'no conduce', density: 0.92 },
  { name: 'Hierro', state: 'sólido', transparency: 'opaco', conductivity: 'conduce', density: 7.87 },
  { name: 'Hielo', state: 'sólido', transparency: 'transparente', conductivity: 'no conduce', density: 0.92 },
  { name: 'Aluminio', state: 'sólido', transparency: 'opaco', conductivity: 'conduce', density: 2.7 },
  { name: 'Dióxido de carbono', state: 'gas', transparency: 'transparente', conductivity: 'no conduce', density: 0.0018 },
];

const CONFIG = {
  gameCode: 'sustancia-misteriosa',
  title: 'Sustancia misteriosa',
  description: 'Identifica sustancias con las propiedades del catálogo del laboratorio.',
  createQuestion,
};

export function renderSubstanceGame(container) {
  renderMiniQuizGame(container, CONFIG);
}

function createQuestion() {
  const substance = randomItem(SUBSTANCES);
  const otherNames = SUBSTANCES.filter((item) => item.name !== substance.name).map((item) => item.name);
  const density = substance.density < 0.01 ? substance.density.toFixed(4) : substance.density.toFixed(2);
  const clue = `${substance.state}, ${substance.transparency}, ${substance.conductivity}, densidad ${density} g/mL`;
  return makeQuestion(`¿Qué sustancia coincide con estas propiedades: ${clue}?`, substance.name, otherNames);
}
