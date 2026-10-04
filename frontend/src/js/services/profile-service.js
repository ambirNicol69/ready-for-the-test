import { request } from './api.js';

export function getCustomization() {
  return request('/api/profile/customization');
}

export function saveCustomization(settings) {
  return request('/api/profile/customization', { method: 'PUT', body: settings });
}

export function getShop() {
  return request('/api/shop/items');
}

export function purchaseItem(itemId) {
  return request('/api/shop/purchase', { method: 'POST', body: { item_id: itemId } });
}
