import React from 'react'
import Layout from '../components/Layout'
import ProductsTab from '../components/Tabs/ProductsTab'

export default function products() {
  return (
    <Layout pageTitle='Productos'>
        <ProductsTab></ProductsTab>
    </Layout>
  )
}