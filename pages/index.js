import React from 'react'
import Layout from '../components/Layout'

import CashRegisterTab from '../components/Tabs/CashRegisterTab'

export default function Home() {
  return (
    <Layout pageTitle='Caja'>
      <CashRegisterTab></CashRegisterTab>
    </Layout>
  )
}
