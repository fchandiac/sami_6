import React, { useState } from 'react'
import { Grid, Button } from '@mui/material'
import OrdersGrid from '../Grids/OrdersGrid'
import DeleteIcon from '@mui/icons-material/Delete'

const orders = require('../../promises/orders')

export default function Orders() {
  const [ordersGridState, setOrdersGridState] = useState(false)

  const updateOrdersGridState = () => {
    let gridState = ordersGridState == false ? true : false
    setOrdersGridState(gridState)
  }

  const destroyPrAll = (ordersList) => {
    let toDestroy = []
    ordersList.map(order => {
      toDestroy.push(orders.destroy(order.id))
    })

    return Promise.all(toDestroy)
  }

  const destroyClosedOrders = async () => {
    const ordersList = await orders.findAll()
    const closedOrders = ordersList.filter(order => order.state)
    await destroyPrAll(closedOrders)
    updateOrdersGridState()
  }

  const destroyPendingOrders = async () => {
    const ordersList = await orders.findAll()
    const pendingOrders = ordersList.filter(order => !order.state)
    await destroyPrAll(pendingOrders)
    updateOrdersGridState()
  }


  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={2}>
          <Grid container spacing={1} direction={'column'}>
            <Grid item>
              <Button variant="contained" startIcon={<DeleteIcon />} fullWidth onClick={(e) => { destroyClosedOrders() }}>
                Cerrados
              </Button>
            </Grid>
            <Grid item>
              <Button variant="contained" startIcon={<DeleteIcon />} fullWidth onClick={(e) => { destroyPendingOrders()}}>
                Pendientes
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={10}>
          <OrdersGrid update={ordersGridState} />
        </Grid>

      </Grid>
    </>
  )
}
