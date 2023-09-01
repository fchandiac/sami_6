import {Chip, Grid } from '@mui/material'
import React, { useState, useEffect } from 'react'
import AppPaper from '../AppPaper/AppPaper'
import { useAppContext } from '../../AppProvider'

const products = require('../../promises/products')

export default function Favorites(props) {
    const { stockControl } = props
    const [favorites, setFavorites] = useState([])
    const { cart, dispatch, cartChanged, product, actionType } = useAppContext()

    useEffect(() => {
        products.findAll().then(res => {
            let data = res.filter(product => product.favorite == true)
            setFavorites(data)
        }).catch(err => {
            console.log(err)
        })
    }, [])

    // id: params.row.id,
    //                         name: params.row.name,
    //                         quanty: 1,
    //                         sale: params.row.sale,
    //                         subTotal: params.row.sale,
    //                         discount: 0,
    //                         discountAmount: 0,
    //                         salesRoomStock: params.row.salesRoomStock,
    //                         virtualStock: params.row.salesRoomStock,
    //                         stockControl: params.row.stockControl,
    //                         code: params.row.code,
    //                         specialProduct: false

    const formatProduct = (product) => {
        return ({
            id: product.id,
            name: product.name,
            quanty: 1,
            sale: product.sale,
            subTotal: product.sale,
            discount: 0,
            discountAmount: 0,
            salesRoomStock: product.salesRoomStock,
            virtualStock: product.salesRoomStock,
            stockControl: product.stockControl,
            code: product.code,
            specialProduct: false
        })
    }

    const addToCart = (product) => {
        product = formatProduct(product)
        if (product.stockControl == false) {
            dispatch({ type: 'ADD_TO_CART', value: product })
        } else if (stockControl == true && product.salesRoomStock <= 0) {
            dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'No hay stock disponible' } })
        } else {
            console.log('addToCart', product)
            dispatch({ type: 'ADD_TO_CART', value: product })

        }
    }

    return (
        <>
            <AppPaper title={'Productos favoritos'}>
            <Grid container spacing={1} padding={1}>
                {favorites.map((product) => (
                    <Grid item key={product.id}>
                        <Chip variant='outlined' label={product.name} color='primary' onClick={()=>{addToCart(product)}}/>
                    </Grid>
                ))}
            </Grid>
            </AppPaper>
        </>
    )
}
