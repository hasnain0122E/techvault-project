import React, { useEffect } from 'react'
import styles from './Toast.module.css'

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <span>{type === 'success' ? '✅' : '❌'} {message}</span>
      <button className={styles.close} onClick={onClose}>✕</button>
    </div>
  )
}
