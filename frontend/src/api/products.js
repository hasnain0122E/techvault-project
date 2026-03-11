/**
 * api/products.js
 *
 * Every function here talks to your FastAPI backend.
 * The base URL comes from .env  →  VITE_API_BASE_URL
 *
 * WHY axios?
 *   axios automatically parses JSON, throws on 4xx/5xx,
 *   and lets you set a baseURL once instead of repeating it everywhere.
 */

import axios from 'axios'

// ── Create one axios instance that points at your FastAPI server ──────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,  // reads from .env
  headers: { 'Content-Type': 'application/json' },
})

// ── READ  – GET /products ─────────────────────────────────────────────────
export async function fetchProducts({ page = 1, limit = 20, name = '' } = {}) {
  const params = { page, limit }
  if (name.trim().length >= 3) params.name = name.trim()

  // response.data matches what FastAPI returns:
  // { total_products, limit, page, Items: [...] }
  const response = await api.get('/products', { params })
  return response.data
}

// ── READ ONE  – GET /products/:id ─────────────────────────────────────────
export async function fetchProduct(id) {
  const response = await api.get(`/products/${id}`)
  return response.data
}

// ── CREATE  – POST /products ──────────────────────────────────────────────
export async function createProduct(productData) {
  const response = await api.post('/products', productData)
  return response.data
}

// ── UPDATE  – PUT /products/:id ───────────────────────────────────────────
export async function updateProduct(id, productData) {
  const response = await api.put(`/products/${id}`, productData)
  return response.data
}

// ── DELETE  – DELETE /products/:id ───────────────────────────────────────
export async function deleteProduct(id) {
  const response = await api.delete(`/products/${id}`)
  return response.data
}

export default api
