import { el, clearChildren } from '../utils/dom-helpers.js';
import { createViewHeader, createAlert } from '../utils/ui.js';
import { showToast } from '../utils/toast.js';
import { labelFor } from '../utils/formatters.js';
import * as lab from '../services/lab-service.js';
import { session } from './session.js';

let reagentCache = null;

export function renderMixing(container) {
  clearChildren(container);
  container.appendChild(createViewHeader(
    'Laboratorio',
    'Combina sustancias y observa cómo cambia el color y se manifiesta la reacción.'
  ));

  const grid = el('div', 'dos-columnas');

  const shelfCard = el('section', 'cajon');
  shelfCard.appendChild(el('h3', '', 'Reactivos disponibles'));
  const shelf = el('div', 'estante');
  shelf.id = 'estanteReactivos';
  shelfCard.appendChild(shelf);
  grid.appendChild(shelfCard);

  const mixCard = el('section', 'cajon');
  mixCard.appendChild(el('h3', '', 'Mezcla seleccionada'));
  const slots = el('div', 'estante');
  slots.id = 'slotsMezcla';
  mixCard.appendChild(slots);

  const result = el('div', 'bandeja-resultado');
  result.id = 'zonaResultado';
  const vessel = buildReactionVessel();
  result.append(el('p', '', 'Selecciona dos reactivos y observa el cambio.'), vessel.scene);
  mixCard.appendChild(result);

  const mixButton = el('button', 'btn btn-ambar btn-bloque', '🧪 Mezclar');
  mixButton.id = 'btnMezclar';
  mixButton.disabled = true;
  mixCard.appendChild(mixButton);

  grid.appendChild(mixCard);
  container.appendChild(grid);

  initMixingArea(shelf, slots, result, mixButton, vessel);
}

function initMixingArea(shelf, slots, result, mixButton, vessel) {
  const selected = [];
  let reagents = reagentCache || [];

  function renderShelf() {
    clearChildren(shelf);
    for (const reagent of reagents) {
      const vial = buildVial(reagent);
      const isSelected = selected.includes(reagent.id);
      vial.classList.toggle('is-seleccionado', isSelected);
      vial.addEventListener('click', () => toggleSelection(reagent));
      shelf.appendChild(vial);
    }
    if (reagents.length === 0) {
      shelf.appendChild(el('p', 'estado-vacio', 'No hay reactivos disponibles.'));
    }
  }

  function renderSlots() {
    clearChildren(slots);
    for (let i = 0; i < 2; i++) {
      const slot = el('div', 'vial');
      slot.classList.add('is-slot');
      if (selected[i]) {
        const reagent = reagents.find((item) => item.id === selected[i]);
        const dot = buildColorDot(reagent.color_hex);
        slot.appendChild(dot);
        slot.appendChild(el('span', '', reagent.name));
      } else {
        slot.appendChild(el('span', '', `Elegir reactivo ${i === 0 ? 'A' : 'B'}`));
      }
      slots.appendChild(slot);
    }
    mixButton.disabled = selected.length < 2;
  }

  function toggleSelection(reagent) {
    const index = selected.indexOf(reagent.id);
    if (index >= 0) {
      selected.splice(index, 1);
    } else if (selected.length < 2) {
      selected.push(reagent.id);
    } else {
      showToast('Ya seleccionaste dos reactivos', 'error');
      return;
    }
    renderShelf();
    renderSlots();
    renderPreview();
  }

  function renderPreview() {
    const chosen = selected.map((id) => reagents.find((item) => item.id === id)).filter(Boolean);
    const color = chosen.length === 2
      ? averageHex(chosen[0].color_hex, chosen[1].color_hex)
      : chosen[0]?.color_hex || '#9fc5c8';
    animateVessel(vessel, color, false);
    result.replaceChildren(vessel.scene, el('p', '', chosen.length === 2 ? 'Listo para mezclar.' : 'Selecciona dos reactivos y observa el cambio.'));
  }

  async function doMix() {
    if (selected.length < 2) {
      return;
    }
    mixButton.disabled = true;
    result.replaceChildren(vessel.scene, el('p', '', 'Mezclando las sustancias…'));
    vessel.scene.classList.add('is-mezclando');
    try {
      const data = await lab.mixReagents({ reagentAId: selected[0], reagentBId: selected[1] });
      renderResult(data);
      await session.reload();
      if (data.points_awarded > 0) {
        showToast(`¡+${data.points_awarded} puntos!`, 'ok');
      }
    } catch (error) {
      vessel.scene.classList.remove('is-mezclando');
      result.replaceChildren(vessel.scene, createAlert(error.message));
    } finally {
      mixButton.disabled = selected.length < 2;
    }
  }

  function renderResult(data) {
    vessel.scene.classList.remove('is-mezclando');
    const color = data.reaction?.result_color_hex || colorOfSelected();
    animateVessel(vessel, color, data.effect !== 'ninguno' && data.effect !== null);
    result.replaceChildren(vessel.scene);
    if (data.reaction === null) {
      result.appendChild(el('p', 'bandeja-nombre', 'Mezcla sin reacción visible'));
      result.appendChild(el('p', 'bandeja-efecto', 'Las sustancias se combinaron, pero no se observó un cambio químico.'));
      return;
    }
    result.appendChild(el('p', 'bandeja-nombre', data.reaction.result_name));
    result.appendChild(el('span', 'badge badge-verde', labelFor(data.effect)));
    result.appendChild(el('p', 'bandeja-efecto', data.reaction.description));
  }

  function colorOfSelected() {
    const chosen = selected.map((id) => reagents.find((item) => item.id === id)).filter(Boolean);
    return chosen.length > 1 ? averageHex(chosen[0].color_hex, chosen[1].color_hex) : chosen[0]?.color_hex || '#9fc5c8';
  }

  mixButton.addEventListener('click', doMix);

  async function load() {
    try {
      if (reagentCache === null) {
        reagentCache = await lab.listReagents();
      }
      reagents = reagentCache;
      renderShelf();
      renderSlots();
    } catch (error) {
      shelf.replaceChildren(createAlert(error.message));
    }
  }

  load();
}

function buildVial(reagent) {
  const vial = el('button', 'vial');
  const dot = buildColorDot(reagent.color_hex);
  vial.appendChild(dot);
  vial.appendChild(el('span', '', `${reagent.icon} ${reagent.name}`));
  return vial;
}

function buildColorDot(colorHex) {
  const dot = el('span', 'vial-muestra');
  dot.style.setProperty('--vial-color', colorHex);
  return dot;
}

function buildReactionVessel() {
  const scene = el('div', 'escena-mezcla');
  const vessel = el('div', 'vaso-mezcla');
  const liquid = el('div', 'liquido-mezcla');
  vessel.appendChild(liquid);
  scene.appendChild(vessel);
  return { scene, liquid };
}

function animateVessel(vessel, color, hasReaction) {
  vessel.liquid.style.setProperty('--color-liquido', color);
  vessel.scene.classList.toggle('hay-reaccion', hasReaction);
  vessel.scene.classList.remove('is-lleno');
  requestAnimationFrame(() => vessel.scene.classList.add('is-lleno'));
}

function averageHex(first, second) {
  const channels = [1, 3, 5].map((offset) => {
    const a = Number.parseInt(first.slice(offset, offset + 2), 16) || 0;
    const b = Number.parseInt(second.slice(offset, offset + 2), 16) || 0;
    return Math.round((a + b) / 2).toString(16).padStart(2, '0');
  });
  return `#${channels.join('')}`;
}
