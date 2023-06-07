import React, { useRef, useEffect, useState } from 'react'
import AppPaper from '../AppPaper/AppPaper'
import { Grid, IconButton, TextField } from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import { useAppContext } from '../../AppProvider'

const products = require('../../promises/products')
const orders = require('../../promises/orders')




export default function OrdersLoader(props) {
    const { dispatch, ordersInCart } = useAppContext()
    const { inputOrderRef } = props
    const [orderId, setOrderId] = useState('')

    const addOrderToCart = async () => {
        console.log('load...')
        let order_id = orderId
        const findOrderDB = await orders.findOneById(order_id)
        if (findOrderDB != null) {

            let cart = findOrderDB.ordersdetails

            let findOrder = ordersInCart.find(item => item.order_id == order_id)
            if (!findOrder) {
                let newCart = []
                for (const item of cart) {
                    const product = await products.findOneById(item.product_id)
                    console.log('product', product)

                    if (product == null) {
                        let pro = {
                            id: Math.floor(Math.random() * (99999 - 20000 + 1)) + 900000,
                            name: item.name,
                            quanty: item.quanty,
                            code: '0001SP' + Math.floor(Math.random() * 1000).toString(),
                            sale: item.sale,
                            discount: item.discount,
                            subTotal: item.subtotal,
                            salesRoomStock: 0,
                            // virtualStock: -1,
                            specialProduct: true,
                            controlStock: false
                        }
                        newCart.push(pro)
                    } else {
                        let salesRoomStock = product.Stocks.find(item => (item.storage_id == 1001)) == undefined ? 0 : product.Stocks.find(item => (item.storage_id == 1001)).stock
                        let pro = {
                            id: product.id,
                            name: product.name,
                            quanty: 1,
                            code: product.code,
                            sale: item.sale,
                            discount: item.discount,
                            subTotal: item.subtotal,
                            salesRoomStock: salesRoomStock,
                            virtualStock: salesRoomStock,
                            specialProduct: false,
                            stockControl: product.stock_control
                        }
                        for (let i = 0; i < item.quanty; i++) {
                            newCart.push(pro)
                        }
                    }

                }

                console.log('new', newCart)
                newCart.map(item => {
                    dispatch({ type: 'OPEN_SNACK', value: { type: 'success', message: 'Pedido cargado' } })

                    if (item.specialProduct == true) {
                        dispatch({ type: 'ADD_SPECIAL_TO_CART', value: item })
                    } else {
                        dispatch({ type: 'ADD_TO_CART', value: item })
                    }

                })
                ordersInCart.push({ order_id: order_id })
                dispatch({ type: 'SET_ORDERS_IN_CART', value: ordersInCart })

            } else {
                dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'El pedido ya se encuentra en la lista' } })
            }
        } else {
            dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'El pedido no existe' } })
        }

        setOrderId('')
        inputOrderRef.current.focus()

    }



    return (
        <>
            <form onSubmit={(e) => { e.preventDefault(); addOrderToCart() }}>
                <AppPaper title='Cargar pedido'>
                    <Grid container spacing={1} padding={1}>
                        <Grid item xs>
                            <TextField
                                inputRef={inputOrderRef}
                                label="Pedido"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                variant="outlined"
                                size={'small'}
                                fullWidth
                            />
                        </Grid>
                        <Grid item alignSelf={'flex-end'}>
                            <IconButton type='submit'>
                                <ShoppingCartIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                </AppPaper>
            </form>

        </>
    )
}
