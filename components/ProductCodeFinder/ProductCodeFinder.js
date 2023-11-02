import React, { useState, useRef, useEffect } from 'react'
import { Grid, IconButton, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Button, Box, Card, Typography, Stack } from '@mui/material'
import { useAppContext } from '../../AppProvider'
import Barcode from 'react-barcode'
import AppPaper from '../AppPaper/AppPaper'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import WidgetsOutlinedIcon from '@mui/icons-material/WidgetsOutlined'
import WidgetsIcon from '@mui/icons-material/Widgets'
import useCart from '../../hooks/useCart'





const products = require('../../promises/products')
const stocks = require('../../promises/stocks')
const utils = require('../../utils')

export default function ProductCodeFinder(props) {
    const { stockControl, inputCodeRef } = props
    const { cart, dispatch, openSnack } = useAppContext()
    const {getCart, findProductByCode, addProductToCartFromCode} = useCart()
    const [code, setCode] = useState('')
    const [openSelectionDialog, setOpenSelectionDialog] = useState(false)
    const [productsList, setProductsList] = useState([])

    const addProduct = async(code) => {
        await addProductToCartFromCode(code)
        setCode('')
    }

    // const addProduct = (code) => {
    //     products.findOneByCode(code)
    //         .then(res => {
    //             if (res.length === 0) {
    //                 setCode('')
    //                 inputCodeRef.current.focus()
    //                 dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'Producto no encontrado' } })
    //             } else if (res.length > 1) {
    //                 setProductsList(res)
    //                 setOpenSelectionDialog(true)
    //             } else {
    //                 let product = cart.find((product) => product.id === res[0].id)
    //                 if (product === undefined) {
    //                     if (res[0].stock_control == false) {
    //                         product = {
    //                             id: res[0].id,
    //                             name: res[0].name,
    //                             quanty: 1,
    //                             sale: res[0].sale,
    //                             subTotal: res[0].sale,
    //                             salesRoomStock: res[0].Stocks.find(item => (item.storage_id == 1001)).stock,
    //                             virtualStock: res[0].Stocks.find(item => (item.storage_id == 1001)).stock,
    //                             discount: 0,
    //                             controlStock: res[0].stock_control,
    //                             code: res[0].code,
    //                             affected: res[0].affected
    //                         }
    //                         setCode('')
    //                         inputCodeRef.current.focus()
    //                         dispatch({ type: 'ADD_TO_CART', value: product })
    //                     } else if (stockControl == true && res[0].Stocks.find(item => (item.storage_id == 1001)).stock <= 0) {
    //                         setCode('')
    //                         inputCodeRef.current.focus()
    //                         dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'No hay stock disponible' } })
    //                     } else {
    //                         product = {
    //                             id: res[0].id,
    //                             name: res[0].name,
    //                             quanty: 1,
    //                             sale: res[0].sale,
    //                             subTotal: res[0].sale,
    //                             salesRoomStock: res[0].Stocks.find(item => (item.storage_id == 1001)).stock,
    //                             virtualStock: res[0].Stocks.find(item => (item.storage_id == 1001)).stock,
    //                             discount: 0,
    //                             controlStock: res[0].control_stock,
    //                             code: res[0].code,
    //                             affected: res[0].affected
    //                         }
    //                         setCode('')
    //                         inputCodeRef.current.focus()
    //                         dispatch({ type: 'ADD_TO_CART', value: product })

    //                     }
    //                 } else {
    //                     console.log(product)
    //                     if (product.controlStock == false) {
    //                         setCode('')
    //                         inputCodeRef.current.focus()
    //                         dispatch({ type: 'ADD_TO_CART', value: product })

    //                     } else if (stockControl == true && product.virtualStock <= 0) {
    //                         setCode('')
    //                         inputCodeRef.current.focus()
    //                         dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'No hay stock disponible' } })
    //                     } else {
    //                         setCode('')
    //                         inputCodeRef.current.focus()
    //                         dispatch({ type: 'ADD_TO_CART', value: product })

    //                     }

    //                 }
    //             }
    //         })
    //         .catch(err => { console.log(err) })

    // }

    // const addToCart = (product) => {
    //     setOpenSelectionDialog(false)
    //     let productInCart = cart.find((item) => item.id === product.id)
    //     if (productInCart === undefined) {
    //         if (product.stockControl == false) {
    //             dispatch({ type: 'ADD_TO_CART', value: product })
    //             setCode('')
    //         } else if (stockControl == true && product.salesRoomStock <= 0) {
    //             dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'No hay stock disponible' } })
    //         } else {
    //             dispatch({ type: 'ADD_TO_CART', value: product })
    //             setCode('')
    //         }
    //     } else {
    //         if (productInCart.stockControl == false) {
    //             dispatch({ type: 'ADD_TO_CART', value: product })
    //             setCode('')
    //         } else if (stockControl == true && productInCart.virtualStock <= 0) {
    //             dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'No hay stock disponible' } })
    //         } else {
    //             dispatch({ type: 'ADD_TO_CART', value: product })
    //             setCode('')
    //         }
    //     }
    // }

    

    




    const renderStockControl = (product) => {
        if (product.stock_control == false) {
            return (
                <WidgetsOutlinedIcon />
            )
        } else {
            return (
                <WidgetsIcon />
            )
        }
    }


    return (
        <>
            <form onSubmit={(e) => { e.preventDefault(); addProduct(code) }}>
                <AppPaper title='Cargar producto'>
                    <Grid container spacing={1} padding={1}>
                        <Grid item xs>
                            <TextField
                                inputRef={inputCodeRef}
                                label="Código"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
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
            <Dialog open={openSelectionDialog} fullWidth maxWidth={'md'}>
                <DialogTitle sx={{ p: 2 }}>Selección de producto</DialogTitle>
                <DialogContent sx={{ p: 2 }}>
                    <Grid container spacing={1}>
                        {productsList.map((product) => (
                            <Grid item key={product.id} xs={4}>
                                <Card variant={'outlined'}>
                                    <Box sx={{ backgroundColor: '#e3f2fd', padding: 1 }} textAlign={'right'} display="flex" justifyContent={'right'} alignItems="center">
                                        <Stack marginRight={1}>
                                            <Typography fontSize={20}> {product.name}</Typography>
                                            <Typography variant={'caption'}> {product.Category.name}</Typography>
                                        </Stack>
                                        <IconButton onClick={() => {
                                            // addToCart({
                                            //     id: product.id,
                                            //     name: product.name,
                                            //     quanty: 1,
                                            //     sale: product.sale,
                                            //     subTotal: product.sale,
                                            //     salesRoomStock: product.Stocks.find(item => (item.storage_id == 1001)).stock,
                                            //     virtualStock: product.Stocks.find(item => (item.storage_id == 1001)).stock,
                                            //     discount: 0,
                                            //     stockControl: product.stock_control

                                            // })
                                        }}>
                                            <ShoppingCartIcon />
                                        </IconButton>
                                    </Box>
                                    <Box sx={{ padding: 1 }}>
                                        <Typography> {utils.renderMoneystr(product.sale)}</Typography>
                                        <Stack direction="row" spacing={1} alignItems={'center'} justifyContent={'space-between'}>
                                            <Typography>{'Stock en sala: ' + product.Stocks.find(item => (item.storage_id == 1001)).stock}</Typography>
                                            {renderStockControl(product)}
                                        </Stack>

                                    </Box>
                                    <Box sx={{ padding: 1 }} textAlign={'center'}>
                                        <Barcode value={product.code} fontSize={12} width={2} height={50} />
                                    </Box>



                                </Card>
                            </Grid>
                        ))}

                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button variant={'outlined'} onClick={() => setOpenSelectionDialog(false)}>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
