import React from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './ProductCard.module.css'

const BRAND_ICON = { Apple:'🍎', Samsung:'📡', Dell:'🖥️', HP:'🖨️', Xiaomi:'⚡', OnePlus:'🔥', Lenovo:'🔷', Sony:'🎮', Asus:'🛡️', Realme:'💫' }
const CAT_ICON   = { mobiles:'📱', laptops:'💻', electronics:'🔌', accessories:'🎧' }

function Stars({ rating }) {
  return (
    <span className={styles.stars}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating) ? '#fbbf24' : 'var(--border)' }}>★</span>
      ))}
    </span>
  )
}

export default function ProductCard({ product, onDelete }) {
  const navigate = useNavigate()
  const discount  = product.discount_percentage ?? product.discount_percent ?? 0
  const rawPrice  = product.price
  const finalPrice = product.final_price ?? rawPrice * (1 - discount / 100)

  const handleDelete = (e) => {
    e.stopPropagation()
    if (window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      onDelete(product.id)
    }
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    navigate(`/edit/${product.id}`, { state: { product } })
  }

  return (
    <div className={styles.card} onClick={() => navigate(`/products/${product.id}`)}>
      {/* Top image area */}
      <div className={styles.imgArea}>
        <span className={styles.bigIcon}>
          {BRAND_ICON[product.brand] || '📦'} {CAT_ICON[product.category] || ''}
        </span>
        {discount > 0 && <span className={styles.discBadge}>-{discount}%</span>}
        {product.stock <= 5 && product.stock > 0 && <span className={styles.lowBadge}>Low Stock</span>}
        {product.stock === 0 && <span className={styles.outBadge}>Out of Stock</span>}
      </div>

      {/* Body */}
      <div className={styles.body}>
        <p className={styles.brand}>{product.brand} · {product.category}</p>
        <h3 className={styles.name}>{product.name}</h3>
        <div className={styles.ratingRow}>
          <Stars rating={product.rating} />
          <span className={styles.ratingNum}>{product.rating}</span>
        </div>
        <div className={styles.tags}>
          {(product.Tags || product.tags || []).slice(0, 3).map(t => (
            <span key={t} className={styles.tag}>{t}</span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.priceBox}>
          {discount > 0 && <s className={styles.oldPrice}>PKR{rawPrice.toLocaleString('en-IN')}</s>}
          <span className={styles.price}>PKR{Math.round(finalPrice).toLocaleString('en-IN')}</span>
        </div>
        <div className={styles.actions}>
          <button className={styles.btnEdit}   onClick={handleEdit}>✏️</button>
          <button className={styles.btnDelete} onClick={handleDelete}>🗑️</button>
        </div>
      </div>
    </div>
  )
}
