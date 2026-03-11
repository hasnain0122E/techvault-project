/**
 * hooks/useProducts.js
 *
 * A custom React hook that:
 *  - holds all products in state
 *  - calls the API functions from api/products.js
 *  - manages loading + error states
 *
 * Any component just calls: const { products, loading, deleteProduct } = useProducts()
 */

import { useState, useEffect, useCallback } from 'react'
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct as apiDelete,
} from '../api/products'

export function useProducts() {
  const [products, setProducts]   = useState([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  const [page, setPage]           = useState(1)
  const [searchName, setSearchName] = useState('')
  const LIMIT = 20

  // ── Load products whenever page or search changes ─────────────────────
  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchProducts({ page, limit: LIMIT, name: searchName })
      setProducts(data.Items)
      setTotal(data.total_products)
    } catch (err) {
      // If 404, backend means "no results" not a real error
      if (err.response?.status === 404) {
        setProducts([])
        setTotal(0)
      } else {
        setError(err.response?.data?.detail || 'Failed to load products')
      }
    } finally {
      setLoading(false)
    }
  }, [page, searchName])

  useEffect(() => { loadProducts() }, [loadProducts])

  // ── Add a new product ─────────────────────────────────────────────────
  const addProduct = async (productData) => {
    setLoading(true)
    setError(null)
    try {
      const newProduct = await createProduct(productData)
      await loadProducts()   // refresh the list from server
      return { success: true, data: newProduct }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to create product'
      setError(msg)
      return { success: false, error: msg }
    } finally {
      setLoading(false)
    }
  }

  // ── Edit an existing product ──────────────────────────────────────────
  const editProduct = async (id, productData) => {
    setLoading(true)
    setError(null)
    try {
      const updated = await updateProduct(id, productData)
      await loadProducts()
      return { success: true, data: updated }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to update product'
      setError(msg)
      return { success: false, error: msg }
    } finally {
      setLoading(false)
    }
  }

  // ── Delete a product ──────────────────────────────────────────────────
  const removeProduct = async (id) => {
    setLoading(true)
    setError(null)
    try {
      await apiDelete(id)
      await loadProducts()
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to delete product'
      setError(msg)
      return { success: false, error: msg }
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(total / LIMIT)

  return {
    products,
    total,
    loading,
    error,
    page,
    totalPages,
    searchName,
    setPage,
    setSearchName,
    addProduct,
    editProduct,
    removeProduct,
    reload: loadProducts,
  }
}
