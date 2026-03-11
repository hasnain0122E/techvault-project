/**
 * pages/CreatePage.jsx
 *
 * Uses the shared ProductForm and calls addProduct from useProducts.
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProductForm from '../components/ProductForm'
import Toast from '../components/Toast'
import { useProducts } from '../hooks/useProducts'
import styles from './FormPage.module.css'

export default function CreatePage() {
  const navigate = useNavigate()
  const { addProduct, loading } = useProducts()
  const [toast, setToast] = useState(null)

  const handleSubmit = async (data) => {
    const res = await addProduct(data)

    if (res.success) {
      setToast({ message: 'Product created successfully!', type: 'success' })
      // Wait a moment so the user sees the toast, then go back to list
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
          <h1 className={styles.title}>Add New Product</h1>
          <p className={styles.sub}>Fill in the details below to add to your catalogue</p>
        </div>
      </div>

      <ProductForm
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel="✅ Create Product"
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
