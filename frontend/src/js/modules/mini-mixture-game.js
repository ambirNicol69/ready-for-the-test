import { randomItem, makeQuestion } from './mini-game-content.js';
import { renderMiniQuizGame } from './mini-quiz-game.js';

const REACTIONS = [
  {
    pair: 'bicarbonato de sodio y vinagre',
    result: 'Efervescencia: se libera dióxido de carbono.',
  },
  {
    pair: 'agua oxigenada y yoduro de potasio',
    result: 'Se forma espuma al liberarse oxígeno.',
  },
  {
    pair: 'hidróxido de sodio y sulfato de cobre',
    result: 'Aparece un precipitado azul de hidróxido de cobre.',
  },
  {
    pair: 'fenolftaleína e hidróxido de sodio',
    result: 'El indicador cambia a un color rosa intenso.',
  },
  {
    pair: 'fenolftaleína y vinagre',
    result: 'La mezcla permanece incolora en medio ácido.',
  },
];

const CONFIG = {
  gameCode: 'mezcla-segura',
  title: 'Mezcla segura',
  description: 'Predice los resultados de las reacciones del laboratorio virtual. No mezcles sustancias reales.',
  createQuestion,
};

export function renderMixtureGame(container) {
  renderMiniQuizGame(container, CONFIG);
}

function createQuestion() {
  const reaction = randomItem(REACTIONS);
  const alternatives = REACTIONS
    .filter((item) => item.result !== reaction.result)
    .map((item) => item.result);
  return makeQuestion(`En la simulación, ¿qué ocurre al combinar ${reaction.pair}?`, reaction.result, alternatives);
}
