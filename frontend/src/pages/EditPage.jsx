/**
 * pages/EditPage.jsx
 *
 * Pre-fills the form with the product passed via router state.
 * Calls editProduct on submit.
 */

import React, { useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import ProductForm from '../components/ProductForm'
import Toast from '../components/Toast'
import { useProducts } from '../hooks/useProducts'
import styles from './FormPage.module.css'

export default function EditPage() {
  const navigate = useNavigate()
  const { id }   = useParams()
  const { state } = useLocation()   // state.product comes from ProductCard onClick
  const { editProduct, loading } = useProducts()
  const [toast, setToast] = useState(null)

  // If no state (user navigated directly), redirect home
  if (!state?.product) {
    return (
      <div className={styles.page}>
        <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>Product data not found.</p>
        <button className={styles.backBtn} onClick={() => navigate('/')}>← Go back</button>
      </div>
    )
  }

  const handleSubmit = async (data) => {
    const res = await editProduct(id, data)

    if (res.success) {
      setToast({ message: 'Product updated!', type: 'success' })
      setTimeout(() => navigate('/'), 1200)
    } else {
      setToast({ message: res.error, type: 'error' })
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>← Back</button>
        <div>
          <h1 className={styles.title}>Edit Product</h1>
          <p className={styles.sub}>{state.product.name}</p>
        </div>
      </div>

      <ProductForm
        initialData={state.product}
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel="💾 Save Changes"
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
