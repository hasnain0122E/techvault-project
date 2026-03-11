import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>⚡ TechVault</Link>
      <nav className={styles.nav}>
        <Link to="/"        className={`${styles.link} ${pathname === '/'        ? styles.active : ''}`}>Products</Link>
        <Link to="/create"  className={`${styles.link} ${pathname === '/create'  ? styles.active : ''}`}>+ Add Product</Link>
      </nav>
    </header>
  )
}
