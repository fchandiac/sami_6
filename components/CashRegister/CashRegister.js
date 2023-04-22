import { Grid, IconButton, TextField } from '@mui/material'
import React, { useState, useRef } from 'react'
import ShoppingCart from '../ShoppingCart'
import ProductFinder from '../ProductFinder/ProductFinder'
import Favorites from '../Favorites/Favorites'
import AppPaper from '../AppPaper/AppPaper'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import { useAppContext } from '../../AppProvider'

const products = require('../../promises/products')

export default function CashRegister() {
  const { dispatch } = useAppContext()
  const [code, setCode] = useState('')
  const inputCode = useRef(null)

  const addProduct = (code) => {
    products.findOneByCode(code)
      .then(res => {
        let product = {
          id: res.id,
          name: res.name,
          quanty: 1,
          sale: res.Price.sale,
          subTotal: res.Price.sale,
          discount: 0
        }
        dispatch({ type: 'ADD_TO_CART', value: product })
        setCode('')
        inputCode.current.focus()
      })
      .catch(err => { console.log(err) })


  }
  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <form onSubmit={(e) => { e.preventDefault(); addProduct(code) }}>
                <AppPaper title='Cargar producto'>
                  <Grid container spacing={1} padding={1}>
                    <Grid item xs={10}>
                      <TextField
                        ref={inputCode}
                        label="Código"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        variant="outlined"
                        size={'small'}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <IconButton type='submit'>
                        <ShoppingCartIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </AppPaper>
              </form>
            </Grid>
            <Grid item xs={12}>
              <ProductFinder />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={6}>
          <ShoppingCart></ShoppingCart>
        </Grid>
      </Grid>
    </>
  )
}
