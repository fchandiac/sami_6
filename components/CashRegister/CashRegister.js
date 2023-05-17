import { Grid } from '@mui/material'
import React, { useState, useEffect, useRef } from 'react'
import ShoppingCart from '../ShoppingCart'
import ProductFinder from '../ProductFinder/ProductFinder'
import Favorites from '../Favorites/Favorites'
import electron from 'electron'
const ipcRenderer = electron.ipcRenderer || false
import { useAppContext } from '../../AppProvider'

import ProductCodeFinder from '../ProductCodeFinder/ProductCodeFinder'
import OrdersLoader from '../OrdersLoader/OrdersLoader'
const stocks = require('../../promises/stocks')


export default function CashRegister() {
  const { dispatch, webConnection } = useAppContext()
  const [cashRegisterUI, setCashRegisterUI] = useState({})
  const inputCodeRef = useRef(null)
  const inputOrderRef = useRef(null)
  // const [ cartChanged, setCartChanged ] = useState(false)



  useEffect(() => {
    let cashRegisterUI = ipcRenderer.sendSync('get-cash-register-UI', 'sync')
    setCashRegisterUI(cashRegisterUI)

    stocks.findAllStockAlert()
      .then(res => { dispatch({ type: 'SET_STOCK_ALERT_LIST', value: res }) })
      .catch(err => { console.log(err) })
    
    if(!webConnection){
      dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'No hay conexión a internet' } })
    }
  
  }, [])

  useEffect(() => {
    if (cashRegisterUI.orders_priority == false){
      inputOrderRef.current.blur()
      inputCodeRef.current.focus()
    }

    if (cashRegisterUI.orders_priority == true){
      inputCodeRef.current.blur()
      inputOrderRef.current.focus()
    }
  }, [cashRegisterUI])

  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={5}>
          <Grid container spacing={1} direction={'column'}>
            <Grid item>
              <Grid container spacing={1}>
                <Grid item xs={cashRegisterUI.orders_loader? 6: 12}>
                  <ProductCodeFinder stockControl={cashRegisterUI.stock_control} inputCodeRef={inputCodeRef}/>
                </Grid>
                <Grid item xs={6} sx={{display: cashRegisterUI.orders_loader? 'block': 'none'}}>
                  <OrdersLoader inputOrderRef={inputOrderRef}/>
                </Grid>
              </Grid>
            </Grid>
            <Grid item sx={{display: cashRegisterUI.favorites? 'block': 'none'}}>
              <Favorites stockControl={cashRegisterUI.stock_control} />
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
