import { Grid, IconButton, TextField } from '@mui/material'
import React, { useState, useEffect } from 'react'
import ShoppingCart from '../ShoppingCart'
import ProductFinder from '../ProductFinder/ProductFinder'
import Favorites from '../Favorites/Favorites'
import electron from 'electron'
const ipcRenderer = electron.ipcRenderer || false
import { useAppContext } from '../../AppProvider'

import ProductCodeFinder from '../ProductCodeFinder/ProductCodeFinder'
const stocks = require('../../promises/stocks')


export default function CashRegister() {
  const { dispatch } = useAppContext()
  const [cashRegisterUI, setCashRegisterUI] = useState({})
  // const [ cartChanged, setCartChanged ] = useState(false)

  useEffect(() => {
    let cashRegisterUI = ipcRenderer.sendSync('get-cash-register-UI', 'sync')
    setCashRegisterUI(cashRegisterUI)
    stocks.findAllStockAlert()
      .then(res => { dispatch({ type: 'SET_STOCK_ALERT_LIST', value: res }) })
      .catch(err => { console.log(err) })
  }, [])

  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={5}>
          <Grid container spacing={1} direction={'column'}>
            <Grid item>
              <ProductCodeFinder stockControl={cashRegisterUI.stock_control} />
            </Grid>
            <Grid item>
              <ProductFinder stockControl={cashRegisterUI.stock_control} />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={7}>
          <ShoppingCart stockControl={cashRegisterUI.stock_control} quote={cashRegisterUI.quote} />
        </Grid>
      </Grid>
    </>
  )
}
