import React, { useEffect, useState } from 'react'
import AppPaper from '../../AppPaper'
import { Button, Grid, TextField, Autocomplete } from '@mui/material'
import AppErrorSnack from '../../AppErrorSnack'

const categories = require('../../../promises/categories')
const taxes = require('../../../promises/taxes')
const products = require('../../../promises/products')
const utils = require('../../../utils')
const prices = require('../../../promises/prices')


export default function NewProducForm(props) {
    const { updateGrid } = props
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



    const saveProduct = (e) => {
        if (productData.sale === '') {
            setErrorText('El precio no puede estar vacío')
            setOpenErrorSnack(true)
        } else {
            products.findOneByName(productData.name)
            .then(res => {
                if(res !== null){
                    setErrorText('El nombre del producto ya existe')
                    setOpenErrorSnack(true)
                } else {
                    let purchase = productData.purchase === '' ? 0 : utils.moneyToInt(productData.purchase)
                    prices.create(productData.tax.id, utils.moneyToInt(productData.sale), purchase)
                    .then(res => {
                        let price_id = res.id
                        products.create(productData.name, productData.code, productData.category.id, price_id)
                        .then(res => {
                            console.log(res)
                            updateGrid()
                            setProductData(productDataDefault())
                        })
                        .catch(err => {
                            console.error(err)
                            if(err.errors[0].message === 'name must be unique'){
                                setErrorText('El nombre del producto ya existe')
                                setOpenErrorSnack(true)
                            } 
                        })
                    })
                    .catch(err => {console.error(err)})
                }
            })
            .catch(err => {console.error(err)})
        }
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
                                label="Código"
                                value={productData.code}
                                onChange={(e) => { setProductData({ ...productData, code: e.target.value }) }}
                                variant="outlined"
                                size={'small'}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item>
                            <TextField
                                label="Precio de venta"
                                value={utils.renderMoneystr(productData.sale)}
                                onChange={(e) => { setProductData({ ...productData, sale: e.target.value }) }}
                                variant="outlined"
                                size={'small'}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item>
                            <TextField
                                label="Precio de compra"
                                value={utils.renderMoneystr(productData.purchase)}
                                onChange={(e) => { setProductData({ ...productData, purchase: e.target.value }) }}
                                variant="outlined"
                                size={'small'}
                                fullWidth
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
                        <Grid item textAlign='right'>
                            <Button variant={'contained'} type='submit'>guardar</Button>
                        </Grid>
                    </Grid>
                </form>
            </AppPaper>
            <AppErrorSnack openSnack={openErrorSnack} setOpenSnack={setOpenErrorSnack} errorText={errorText} />
        </>
    )
}

function productDataDefault() {
    return {
        name: '',
        sale: '',
        code: '',
        purchase: '',
        category: null,
        tax: null
    }
}