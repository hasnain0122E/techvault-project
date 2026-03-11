/**
 * ProductForm.jsx
 *
 * Reusable form used by both CreatePage and EditPage.
 * Props:
 *   initialData  – pre-fills fields when editing
 *   onSubmit(data) – called with the form payload
 *   loading      – disables submit button while saving
 *   submitLabel  – button text
 */

import React, { useState } from 'react'
import styles from './ProductForm.module.css'

const EMPTY = {
  sku: '', name: '', description: '', category: 'mobiles',
  brand: '', price: '', currency: 'PKR', discount_percentage: 0,
  stock: '', is_active: true, rating: '',
  Tags: '',          // comma-separated string in the form → array on submit
  image_urls: '',    // comma-separated string in the form → array on submit
  // nested
  dimensions_cm: { length: '', width: '', height: '' },
  seller: { seller_id: '', name: '', email: '', website: '' },
}

function flattenInitial(data) {
  if (!data) return EMPTY
  return {
    ...EMPTY,
    ...data,
    Tags: (data.Tags || data.tags || []).join(', '),
    image_urls: (data.image_urls || []).join(', '),
    discount_percentage: data.discount_percentage ?? data.discount_percent ?? 0,
    dimensions_cm: { ...(data.dimensions_cm || EMPTY.dimensions_cm) },
    seller: { ...(data.seller || EMPTY.seller) },
  }
}

export default function ProductForm({ initialData, onSubmit, loading, submitLabel = 'Save' }) {
  const [form, setForm] = useState(() => flattenInitial(initialData))
  const [errors, setErrors] = useState({})

  // ── Generic field updater ─────────────────────────────────────────────
  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const setNested = (group, field, value) => {
    setForm(prev => ({ ...prev, [group]: { ...prev[group], [field]: value } }))
  }

  // ── Validate ──────────────────────────────────────────────────────────
  const validate = () => {
    const e = {}
    if (!form.sku.trim())  e.sku  = 'SKU is required'
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.brand.trim()) e.brand = 'Brand is required'
    if (!form.price || Number(form.price) <= 0) e.price = 'Price must be > 0'
    if (!form.stock && form.stock !== 0) e.stock = 'Stock is required'
    if (!form.rating) e.rating = 'Rating is required'
    if (!form.seller.name.trim()) e.sellerName = 'Seller name is required'
    if (!form.seller.email.trim()) e.sellerEmail = 'Seller email is required'
    if (!form.seller.website.trim()) e.sellerWebsite = 'Seller website is required'
    if (!form.dimensions_cm.length) e.dimLength = 'Length required'
    if (!form.dimensions_cm.width)  e.dimWidth  = 'Width required'
    if (!form.dimensions_cm.height) e.dimHeight = 'Height required'
    return e
  }

  // ── Submit ────────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    // Build the payload that matches FastAPI's Product schema
    const payload = {
      ...form,
      price:               Number(form.price),
      discount_percentage: Number(form.discount_percentage),
      stock:               Number(form.stock),
      rating:              Number(form.rating),
      Tags:                form.Tags.split(',').map(s => s.trim()).filter(Boolean),
      image_urls:          form.image_urls.split(',').map(s => s.trim()).filter(Boolean),
      is_active:           form.is_active,
      dimensions_cm: {
        length: Number(form.dimensions_cm.length),
        width:  Number(form.dimensions_cm.width),
        height: Number(form.dimensions_cm.height),
      },
      seller: {
        seller_id: form.seller.seller_id || '00000000-0000-0000-0000-000000000000',
        name:    form.seller.name,
        email:   form.seller.email,
        website: form.seller.website,
      },
      created_at: initialData?.created_at || new Date().toISOString(),
    }

    // id is set by backend on create; on update we don't send it in body
    if (!initialData) delete payload.id

    onSubmit(payload)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>

      {/* ── Basic Info ─────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Basic Info</h2>
        <div className={styles.grid2}>

          <Field label="SKU *" error={errors.sku}>
            <input value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="e.g. APPL-128GB-001" />
          </Field>

          <Field label="Name *" error={errors.name}>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Apple Model Pro" />
          </Field>

          <Field label="Brand *" error={errors.brand}>
            <input value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="e.g. Apple" />
          </Field>

          <Field label="Category *">
            <select value={form.category} onChange={e => set('category', e.target.value)}>
              <option value="mobiles">Mobiles</option>
              <option value="laptops">Laptops</option>
              <option value="electronics">Electronics</option>
              <option value="accessories">Accessories</option>
            </select>
          </Field>

        </div>

        <Field label="Description">
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="Short product description (max 200 chars)" maxLength={200} />
        </Field>
      </section>

      {/* ── Pricing & Stock ────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Pricing & Stock</h2>
        <div className={styles.grid3}>

          <Field label="Price (PKR) *" error={errors.price}>
            <input type="number" min="0.01" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} placeholder="e.g. 49999" />
          </Field>

          <Field label="Discount % (0–90)">
            <input type="number" min="0" max="90" value={form.discount_percentage} onChange={e => set('discount_percentage', e.target.value)} />
          </Field>

          <Field label="Stock *" error={errors.stock}>
            <input type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="e.g. 50" />
          </Field>

          <Field label="Rating (0–5) *" error={errors.rating}>
            <input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={e => set('rating', e.target.value)} placeholder="e.g. 4.5" />
          </Field>

          <Field label="Active?">
            <select value={String(form.is_active)} onChange={e => set('is_active', e.target.value === 'true')}>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </Field>

        </div>
      </section>

      {/* ── Tags & Images ──────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Tags & Images</h2>
        <div className={styles.grid2}>

          <Field label="Tags (comma-separated)">
            <input value={form.Tags} onChange={e => set('Tags', e.target.value)} placeholder="e.g. 5g, camera, gaming" />
          </Field>

          <Field label="Image URLs (comma-separated)">
            <input value={form.image_urls} onChange={e => set('image_urls', e.target.value)} placeholder="https://cdn.example.com/img.png" />
          </Field>

        </div>
      </section>

      {/* ── Dimensions ────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Dimensions (cm)</h2>
        <div className={styles.grid3}>
          <Field label="Length *" error={errors.dimLength}>
            <input type="number" step="0.1" min="0.1" value={form.dimensions_cm.length} onChange={e => setNested('dimensions_cm','length', e.target.value)} placeholder="e.g. 15.5" />
          </Field>
          <Field label="Width *" error={errors.dimWidth}>
            <input type="number" step="0.1" min="0.1" value={form.dimensions_cm.width} onChange={e => setNested('dimensions_cm','width', e.target.value)} placeholder="e.g. 7.5" />
          </Field>
          <Field label="Height *" error={errors.dimHeight}>
            <input type="number" step="0.1" min="0.1" value={form.dimensions_cm.height} onChange={e => setNested('dimensions_cm','height', e.target.value)} placeholder="e.g. 0.8" />
          </Field>
        </div>
      </section>

      {/* ── Seller ────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Seller Info</h2>
        <div className={styles.grid2}>
          <Field label="Seller Name *" error={errors.sellerName}>
            <input value={form.seller.name} onChange={e => setNested('seller','name', e.target.value)} placeholder="e.g. Apple Store India" />
          </Field>
          <Field label="Seller Email *" error={errors.sellerEmail}>
            <input type="email" value={form.seller.email} onChange={e => setNested('seller','email', e.target.value)} placeholder="support@example.com" />
          </Field>
          <Field label="Seller Website *" error={errors.sellerWebsite}>
            <input value={form.seller.website} onChange={e => setNested('seller','website', e.target.value)} placeholder="https://www.example.com" />
          </Field>
        </div>
        <p className={styles.hint}>⚠️ Seller email domain must be: example.com, store.com, or electronics.com (your backend rule)</p>
      </section>

      {/* ── Submit ────────────────────────────────────────────────── */}
      <button type="submit" className={styles.submitBtn} disabled={loading}>
        {loading ? '⏳ Saving…' : submitLabel}
      </button>

    </form>
  )
}

// ── Small helper wrapper ──────────────────────────────────────────────────
function Field({ label, children, error }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <label style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 500 }}>{label}</label>
      {React.cloneElement(children, { className: `${styles.input} ${error ? styles.inputErr : ''}` })}
      {error && <span style={{ fontSize: '0.72rem', color: 'var(--red)' }}>{error}</span>}
    </div>
  )
}
