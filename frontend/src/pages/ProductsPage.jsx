/**
 * pages/ProductsPage.jsx
 *
 * The main page. Shows all products in a grid.
 * Uses the useProducts hook for all data + actions.
 */

import React, { useState } from 'react'
import { useProducts } from '../hooks/useProducts'
import ProductCard from '../components/ProductCard'
import Toast from '../components/Toast'
import styles from './ProductsPage.module.css'

export default function ProductsPage() {
  const {
    products, total, loading, error,
    page, totalPages, searchName,
    setPage, setSearchName,
    removeProduct,
  } = useProducts()

  const [searchInput, setSearchInput] = useState('')
  const [toast, setToast] = useState(null)

  // ── Search submit ─────────────────────────────────────────────────────
  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    setSearchName(searchInput)
  }

  const handleClear = () => {
    setSearchInput('')
    setSearchName('')
    setPage(1)
  }

  // ── Delete ────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    const res = await removeProduct(id)
    if (res.success) setToast({ message: 'Product deleted!', type: 'success' })
    else             setToast({ message: res.error, type: 'error' })
  }

  return (
    <div className={styles.page}>

      {/* ── Page header ─────────────────────────────────────────── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Products</h1>
          <p className={styles.subtitle}>{total} products in your catalogue</p>
        </div>

        {/* Search form */}
        <form className={styles.searchForm} onSubmit={handleSearch}>
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search by name (min 3 chars)…"
            className={styles.searchInput}
          />
          {searchInput && (
            <button type="button" className={styles.btnClear} onClick={handleClear}>✕</button>
          )}
          <button type="submit" className={styles.btnSearch}>Search</button>
        </form>
      </div>

      {/* ── Error banner ─────────────────────────────────────────── */}
      {error && (
        <div className={styles.errorBanner}>⚠️ {error}</div>
      )}

      {/* ── Loading skeleton ─────────────────────────────────────── */}
      {loading && (
        <div className={styles.grid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      )}

      {/* ── Product grid ─────────────────────────────────────────── */}
      {!loading && products.length > 0 && (
        <div className={styles.grid}>
          {products.map(p => (
            <ProductCard key={p.id} product={p} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────── */}
      {!loading && products.length === 0 && !error && (
        <div className={styles.empty}>
          <p className={styles.emptyIcon}>📭</p>
          <p>No products found.</p>
          {searchName && <button className={styles.btnClear} onClick={handleClear}>Clear search</button>}
        </div>
      )}

      {/* ── Pagination ───────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className={styles.pageBtn}>← Prev</button>
          <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className={styles.pageBtn}>Next →</button>
        </div>
      )}

      {/* ── Toast ────────────────────────────────────────────────── */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
