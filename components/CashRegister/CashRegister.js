import { Grid, IconButton, TextField } from '@mui/material'
import React, { useState, useRef } from 'react'
import ShoppingCart from '../ShoppingCart'
import ProductFinder from '../ProductFinder/ProductFinder'
import Favorites from '../Favorites/Favorites'

import ProductCodeFinder from '../ProductCodeFinder/ProductCodeFinder'


export default function CashRegister() {
  
  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={5}>
          <Grid container spacing={1} direction={'column'}>
            <Grid item>
              <ProductCodeFinder />
            </Grid>
            <Grid item>
              <ProductFinder />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={7}>
          <ShoppingCart></ShoppingCart>
        </Grid>
      </Grid>
    </>
  )
}
