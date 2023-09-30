import React, { useEffect, useState } from 'react'
import AppPaper from '../../AppPaper'
import { Button, Grid, TextField, Autocomplete, Switch, FormControlLabel } from '@mui/material'
import AppErrorSnack from '../../AppErrorSnack'
import { useAppContext } from '../../../AppProvider'

const categories = require('../../../promises/categories')
const taxes = require('../../../promises/taxes')
const products = require('../../../promises/products')
const utils = require('../../../utils')
const prices = require('../../../promises/prices')
const stocks = require('../../../promises/stocks')




export default function NewProducForm(props) {
    const { updateGrid } = props
    const { dispatch } = useAppContext()
    const [categoriesOptions, setCategoriesOptions] = useState([])
    const [categoriesInput, setCategoriesInput] = useState('')
    const [taxesOptions, setTaxesOptions] = useState([])
    const [taxesInput, settaxesInput] = useState('')
    const [openErrorSnack, setOpenErrorSnack] = useState(false)
    const [errorText, setErrorText] = useState('')
    const [productData, setProductData] = useState(productDataDefault())





    useEffect(() => {

        categories.findAll()
            .then(res => {
                let data = res.map(item => ({
                    key: item.id,
                    id: item.id,
                    label: item.name
                }))
                setCategoriesOptions(data)
            })
            .catch(err => { console.error(err) })

    }, [])

    useEffect(() => {
        taxes.findAll()
            .then(res => {
                let data = res.map(item => ({
                    key: item.id,
                    id: item.id,
                    label: item.name
                }))
                setTaxesOptions(data)
            })
            .catch(err => { console.error(err) })
    }, [])



    const saveProduct = () => {
        products.findOneByName(productData.name)
            .then(res => {
                if (res !== null) {
                    dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'El nombre del producto ya existe' } })
                } else {
                    let purchase = 0
                    let sale = 0
                    if (typeof productData.purchase === 'string') {
                        purchase = productData.purchase === '' ? 0 : utils.moneyToInt(productData.purchase)
                    } else { purchase = productData.purchase }
                    if (typeof productData.sale === 'string') {
                        sale = utils.moneyToInt(productData.sale)
                    } else { sale = productData.sale}

                    products.create(productData.name, productData.code, sale, purchase, productData.category.id, productData.tax.id, productData.affected)
                        .then(res => {
                            stocks.create(res.id, 1001, productData.salesRoomStock, productData.criticalSalesRoomStock)
                                .then(() => {
                                    updateGrid()
                                    setProductData(productDataDefault())
                                })
                                .catch(err => { console.error(err) })

                        })
                        .catch(err => {
                            console.error(err)
                            if (err.errors[0].message === 'name must be unique') {
                                dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'El nombre del producto ya existe' } })
                            }
                        })

                }
            })
            .catch(err => { console.error(err) })

    }
    return (
        <>
            <AppPaper title='Nuevo Producto'>
                <form onSubmit={(e) => { e.preventDefault(); saveProduct() }}>
                    <Grid container sx={{ p: 1 }} spacing={1} direction={'column'}>
                        <Grid item>
                            <TextField
                                label="Nombre"
                                value={productData.name}
                                onChange={(e) => { setProductData({ ...productData, name: e.target.value }) }}
                                variant="outlined"
                                size={'small'}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item>
                            <TextField
                                label="Utilidad"
                                value={productData.profit}
                                type='number'
                                onChange={(e) => { 
                                    if ( productData.profit != 0 || productData.purchaseNet != 0){
                                    let profit = e.target.value
                                    let purchase = parseInt(productData.purchaseNet * 1.19)
                                    let sale = parseInt((productData.purchaseNet / (1 - (profit / 100))) * 1.19)
                                    setProductData({
                                        ...productData,
                                        profit: e.target.value,
                                        purchase: purchase,
                                        sale: sale
                                    })
                                    }
                                }}
                                variant="outlined"
                                InputProps={{
                                    endAdornment: '%',
                                }}
                                size={'small'}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item>
                            <TextField
                                label="$ Compra neto"
                                value={utils.renderMoneystr(productData.purchaseNet)}
                                onChange={(e) => {
                                    let value = e.target.value === '' ? 0 : utils.moneyToInt(e.target.value)
                                    let purchase = parseInt(value * 1.19)
                                    let sale = parseInt((value / (1 - (productData.profit / 100))) * 1.19)
                                    setProductData({
                                        ...productData,
                                        purchaseNet: value,
                                        purchase: purchase,
                                        sale: sale
                                    })
                                }}
                                variant="outlined"
                                size={'small'}
                                fullWidth
                            />
                        </Grid>

                        <Grid item>
                            <TextField
                                label="$ Compra"
                                value={utils.renderMoneystr(productData.purchase)}
                                onChange={(e) => { setProductData({ ...productData, purchase: e.target.value }) }}
                                variant="outlined"
                                size={'small'}
                                fullWidth
                                required
                            />
                        </Grid>

                        <Grid item>
                            <TextField
                                label="$ Venta"
                                value={utils.renderMoneystr(productData.sale)}
                                onChange={(e) => { setProductData({ ...productData, sale: e.target.value }) }}
                                variant="outlined"
                                size={'small'}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item>
                            <Autocomplete
                                inputValue={categoriesInput}
                                onInputChange={(e, newInputValue) => {
                                    setCategoriesInput(newInputValue)
                                }}
                                isOptionEqualToValue={(option, value) => null || option.id === value.id}
                                value={productData.category}
                                onChange={(e, newValue) => {
                                    setProductData({ ...productData, category: newValue })
                                }}
                                disablePortal
                                options={categoriesOptions}
                                renderInput={(params) => <TextField {...params} label='Categoría' size={'small'} fullWidth required />}
                            />
                        </Grid>
                        <Grid item>
                            <Autocomplete
                                inputValue={taxesInput}
                                onInputChange={(e, newInputValue) => {
                                    settaxesInput(newInputValue)
                                }}
                                isOptionEqualToValue={(option, value) => null || option.id === value.id}
                                value={productData.tax}
                                onChange={(e, newValue) => {
                                    setProductData({ ...productData, tax: newValue })
                                }}
                                disablePortal
                                options={taxesOptions}
                                renderInput={(params) => <TextField {...params} label='Impuesto' size={'small'} fullWidth required />}
                            />
                        </Grid>
                        <Grid item>
                            <TextField
                                label="Stock en sala de ventas"
                                value={productData.salesRoomStock}
                                onChange={(e) => { setProductData({ ...productData, salesRoomStock: e.target.value }) }}
                                variant="outlined"
                                size={'small'}
                                fullWidth
                            />
                        </Grid>
                        <Grid item>
                            <TextField
                                label="Stock critico en sala de ventas"
                                value={productData.criticalSalesRoomStock}
                                onChange={(e) => { setProductData({ ...productData, criticalSalesRoomStock: e.target.value }) }}
                                variant="outlined"
                                size={'small'}
                                fullWidth
                            />
                        </Grid>
                        <Grid item>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={productData.affected}
                                        onChange={(e) => { setProductData({ ...productData, affected: e.target.checked }) }}
                                    />
                                }
                                label="Venta afecta"
                            />
                        </Grid>
                        <Grid item>
                            <TextField
                                label="Código"
                                value={productData.code}
                                onChange={(e) => { setProductData({ ...productData, code: e.target.value }) }}
                                variant="outlined"
                                size={'small'}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item textAlign='right'>
                            <Button variant={'contained'} type='submit'>guardar</Button>
                        </Grid>
                    </Grid>
                </form>
            </AppPaper>
        </>
    )
}

function productDataDefault() {
    return {
        name: '',
        purchaseNet: '',
        profit: 30,
        sale: '',
        code: '',
        purchase: '',
        category: { id: 0, label: '', key: 0 },
        salesRoomStock: 0,
        criticalSalesRoomStock: 0,
        tax: { id: 0, label: '', key: 0, value: .19 },
        affected: true,
    }
}