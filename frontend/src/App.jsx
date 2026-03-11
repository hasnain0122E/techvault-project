import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar              from './components/Navbar'
import ProductsPage        from './pages/ProductsPage'
import CreatePage          from './pages/CreatePage'
import EditPage            from './pages/EditPage'
import ProductDetailPage   from './pages/ProductDetailPage'

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/"                  element={<ProductsPage />} />
          <Route path="/create"            element={<CreatePage />} />
          <Route path="/edit/:id"          element={<EditPage />} />
          <Route path="/products/:id"      element={<ProductDetailPage />} />
        </Routes>
      </main>
    </>
  )
}
