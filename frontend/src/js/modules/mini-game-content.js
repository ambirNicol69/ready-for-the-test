export function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export function makeQuestion(prompt, answer, distractors) {
  const answerText = String(answer);
  const alternatives = [...new Set(distractors.map(String))].filter((option) => option !== answerText);
  shuffle(alternatives);
  const options = [answerText, ...alternatives.slice(0, 3)];
  while (options.length < 4) options.push(`Otra respuesta ${options.length + 1}`);
  shuffle(options);
  return { prompt, choices: options, correctIndex: options.indexOf(answerText) };
}

function shuffle(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [items[index], items[target]] = [items[target], items[index]];
  }
}
