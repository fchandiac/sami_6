import { Grid } from '@mui/material'
import React from 'react'
import OrdersGrid from '../Grids/OrdersGrid'

export default function Orders() {
  return (
    <>
    <Grid container spacing={1}>
        <Grid item xs={2}>
           
        </Grid>
        <Grid item xs={10}>
        <OrdersGrid/>
        </Grid>
    
    </Grid>
</>
  )
}
