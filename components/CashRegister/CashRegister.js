import { Grid, IconButton, TextField } from '@mui/material'
import React, { useState, useEffect } from 'react'
import ShoppingCart from '../ShoppingCart'
import ProductFinder from '../ProductFinder/ProductFinder'
import Favorites from '../Favorites/Favorites'
import electron from 'electron'
const ipcRenderer = electron.ipcRenderer || false

import ProductCodeFinder from '../ProductCodeFinder/ProductCodeFinder'


export default function CashRegister() {
  const [cashRegisterUI, setCashRegisterUI] = useState({})
  // const [ cartChanged, setCartChanged ] = useState(false)

  useEffect(() => {
    let cashRegisterUI = ipcRenderer.sendSync('get-cash-register-UI', 'sync')
    setCashRegisterUI(cashRegisterUI)
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
              <ProductFinder stockControl={cashRegisterUI.stock_control}/>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={7}>
          <ShoppingCart stockControl={cashRegisterUI.stock_control} />
        </Grid>
      </Grid>
    </>
  )
}
