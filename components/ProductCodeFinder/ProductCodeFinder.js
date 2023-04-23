import React, { useState, useRef } from 'react'
import { Grid, IconButton, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Button, Box, Card, Typography, Stack } from '@mui/material'
import { useAppContext } from '../../AppProvider'
import Barcode from 'react-barcode'
import AppPaper from '../AppPaper/AppPaper'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'

const products = require('../../promises/products')
const utils = require('../../utils')

export default function ProductCodeFinder() {
    const { dispatch } = useAppContext()
    const [code, setCode] = useState('')
    const [openSelectionDialog, setOpenSelectionDialog] = useState(false)
    const [productsList, setProductsList] = useState([])
    const inputCode = useRef(null)


    const addProduct = (code) => {
        products.findOneByCode(code)
            .then(res => {
                if (res.length === 0) {
                    dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'Producto no encontrado' } })
                } else if (res.length > 1) {
                    console.log(res)
                    setProductsList(res)
                    setOpenSelectionDialog(true)
                } else {
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

                }

            })
            .catch(err => { console.log(err) })

    }

    const addToCart = (product) => {
        product = {
            id: product.id,
            name: product.name,
            quanty: 1,
            sale: product.Price.sale,
            subTotal: product.Price.sale,
            discount: 0
        }
        setOpenSelectionDialog(false)
        dispatch({ type: 'ADD_TO_CART', value: product })
        setCode('')
        
        
    }
    return (
        <>
            <form onSubmit={(e) => { e.preventDefault(); addProduct(code) }}>
                <AppPaper title='Cargar producto'>
                    <Grid container spacing={1} padding={1}>
                        <Grid item xs>
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
                                        <IconButton onClick={() => {addToCart(product)} }>
                                            <ShoppingCartIcon />
                                        </IconButton>
                                    </Box>
                                    <Box sx={{ padding: 1 }}>
                                        <Typography> {utils.renderMoneystr(product.Price.sale)}</Typography>
                                        <Typography>{'Stock en sala: ' + 0}</Typography>

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
