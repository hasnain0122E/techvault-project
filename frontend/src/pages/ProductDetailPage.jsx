/**
 * pages/ProductDetailPage.jsx
 *
 * Shows all details for a single product.
 * Fetches from GET /products/:id using fetchProduct from api/products.js
 */

import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchProduct } from '../api/products'
import styles from './ProductDetailPage.module.css'

const BRAND_ICON = { Apple:'🍎', Samsung:'📡', Dell:'🖥️', HP:'🖨️', Xiaomi:'⚡', OnePlus:'🔥', Lenovo:'🔷', Sony:'🎮', Asus:'🛡️', Realme:'💫' }

export default function ProductDetailPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    fetchProduct(id)
      .then(setProduct)
      .catch(err => setError(err.response?.data?.detail || 'Product not found'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className={styles.center}>Loading…</div>
  if (error)   return <div className={styles.center} style={{color:'var(--red)'}}>⚠️ {error}</div>
  if (!product) return null

  const discount   = product.discount_percentage ?? product.discount_percent ?? 0
  const finalPrice = product.final_price ?? product.price * (1 - discount / 100)

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate('/')}>← Back to Products</button>

      <div className={styles.hero}>
        <div className={styles.heroIcon}>{BRAND_ICON[product.brand] || '📦'}</div>
        <div className={styles.heroInfo}>
          <p className={styles.brand}>{product.brand} · {product.category}</p>
          <h1 className={styles.name}>{product.name}</h1>
          <p className={styles.sku}>SKU: {product.sku}</p>
          <p className={styles.description}>{product.description}</p>

          <div className={styles.priceRow}>
            {discount > 0 && <s className={styles.oldPrice}>PKR{product.price.toLocaleString('en-IN')}</s>}
            <span className={styles.price}>PKR{Math.round(finalPrice).toLocaleString('en-IN')}</span>
            {discount > 0 && <span className={styles.disc}>-{discount}%</span>}
          </div>

          <div className={styles.tags}>
            {(product.Tags || product.tags || []).map(t => (
              <span key={t} className={styles.tag}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        <InfoBox label="Rating"    value={`⭐ ${product.rating} / 5`} />
        <InfoBox label="Stock"     value={`${product.stock} units`} color={product.stock < 5 ? 'var(--red)' : 'var(--green)'} />
        <InfoBox label="Status"    value={product.is_active ? '✅ Active' : '❌ Inactive'} />
        <InfoBox label="Currency"  value={product.currency} />
        <InfoBox label="Volume"    value={`${product.product_volume ?? '—'} cm³`} />
        <InfoBox label="Created"   value={new Date(product.created_at).toLocaleDateString()} />
        <InfoBox label="Dimensions"
          value={`${product.dimensions_cm.length} × ${product.dimensions_cm.width} × ${product.dimensions_cm.height} cm`} />
      </div>

      <div className={styles.sellerBox}>
        <p className={styles.sellerLabel}>Seller</p>
        <p className={styles.sellerName}>{product.seller.name}</p>
        <p className={styles.sellerEmail}>{product.seller.email}</p>
        <a className={styles.sellerSite} href={product.seller.website} target="_blank" rel="noreferrer">
          {product.seller.website} ↗
        </a>
      </div>

      <button
        className={styles.editBtn}
        onClick={() => navigate(`/edit/${product.id}`, { state: { product } })}
      >
        ✏️ Edit Product
      </button>
    </div>
  )
}

function InfoBox({ label, value, color }) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: '10px', padding: '0.85rem 1rem'
    }}>
      <p style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem' }}>{label}</p>
      <p style={{ fontWeight: 600, color: color || 'var(--text)' }}>{value}</p>
    </div>
  )
}
