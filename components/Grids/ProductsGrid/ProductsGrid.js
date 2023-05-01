import React, { useEffect, useState } from 'react'
import AppDataGrid from '../../AppDataGrid'
import { GridActionsCellItem } from '@mui/x-data-grid'
import DeleteIcon from '@mui/icons-material/Delete'
import InfoIcon from '@mui/icons-material/Info'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, Autocomplete } from '@mui/material'
import AppPaper from '../../AppPaper/AppPaper'
import StockController from '../../StockController/StockController'



const products = require('../../../promises/products')
const categories = require('../../../promises/categories')
const taxes = require('../../../promises/taxes')
const utils = require('../../../utils')
const prices = require('../../../promises/prices')
const stocks = require('../../../promises/stocks')



export default function ProductsGrid(props) {
    const { update } = props
    const [gridApiRef, setGridApiRef] = useState(null)
    const [rowData, setRowData] = useState(rowDataDefault())
    const [productsList, setProductsList] = useState([])
    const [openInfoDialog, setOpenInfoDialog] = useState(false)
    const [categoriesOptions, setCategoriesOptions] = useState([])
    const [categoriesInput, setCategoriesInput] = useState('')
    const [taxesOptions, setTaxesOptions] = useState([])
    const [taxesInput, settaxesInput] = useState('')
    const [openDestroyDialog, setOpenDestroyDialog] = useState(false)


    useEffect(() => {
        products.findAll().then(res => {
            let data = res.map((item) => ({
                id: item.id,
                name: item.name,
                code: item.code,
                sale: item.Price.sale,
                purchase: item.Price.purchase,
                price_id: item.Price.id,
                tax: item.Price.Tax.name,
                tax_id: item.Price.Tax.id,
                category: item.Category.name,
                category_id: item.Category.id,
                favorite: item.favorite,
                stock: item.Stocks.reduce((accumulator, currentValue) => { return accumulator + currentValue.stock; }, 0),
                salesRoomStock: item.Stocks.find(item => (item.storage_id == 1001)).stock,
            }))
            setProductsList(data)
        })
    }, [update])

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

    const updateFavorite = (rowId, favorite) => {
        products.updateFavorite(rowId, favorite)
            .then(() => {
                gridApiRef.current.updateRows([{ id: rowId, favorite: favorite }])
            })
            .catch(err => { console.error(err) })
    }

    const updateProduct = (e) => {
        if (rowData.sale != rowData.oldSale || rowData.purchase != rowData.oldPurchase) {
            let sale = typeof rowData.sale === 'string' ? utils.moneyToInt(rowData.sale) : rowData.sale
            let purchase = typeof rowData.purchase === 'string' ? utils.moneyToInt(rowData.purchase) : rowData.purchase
            prices.create(rowData.tax_id, sale, purchase)
                .then(res => {
                    products.updateFull(rowData.id, rowData.name, rowData.code, rowData.category_id, res.id)
                        .then(() => {
                            stocks.updateByProductAndStorage(rowData.id, 1001, rowData.salesRoomStock)
                                .then(() => {
                                    gridApiRef.current.updateRows([{
                                        id: rowData.rowId,
                                        name: rowData.name,
                                        code: rowData.code,
                                        category: rowData.category,
                                        sale: rowData.sale,
                                        purchase: rowData.purchase,
                                        salesRoomStock: rowData.salesRoomStock
                                    }])
                                    setOpenInfoDialog(false)
                                })
                                .catch(err => { console.error(err) })
                        })
                        .catch(err => { console.error(err) })
                })
                .catch(err => { console.error(err) })
        } else {
            products.updateFull(rowData.id, rowData.name, rowData.code, rowData.category_id, rowData.price_id)
                .then(() => {
                    stocks.updateByProductAndStorage(rowData.id, 1001, rowData.salesRoomStock)
                        .then(() => {
                            gridApiRef.current.updateRows([{
                                id: rowData.rowId,
                                name: rowData.name,
                                code: rowData.code,
                                category: rowData.category,
                                sale: rowData.sale,
                                purchase: rowData.purchase,
                                salesRoomStock: rowData.salesRoomStock
                            }])
                            setOpenInfoDialog(false)
                        })
                        .catch(err => { console.error(err) })
                })
        }
    }

    const destroy = () => {
        products.destroy(rowData.id)
            .then(() => {
                gridApiRef.current.updateRows([{ id: rowData.rowId, _action: 'delete' }])
                setOpenDestroyDialog(false)
            })
            .catch(err => { console.error(err) })
    }


    const columns = [
        { field: 'id', headerName: 'Id', flex: .3, type: 'number' },
        { field: 'name', headerName: 'Nombre', flex: 1 },
        { field: 'code', headerName: 'Código', flex: .8 },
        { field: 'category', headerName: 'Categoría', flex: 1 },
        { field: 'salesRoomStock', headerName: 'Stock sal de ventas', flex: .5 },
        { field: 'stock', headerName: 'Stock total', flex: .5 },
        { field: 'sale', headerName: 'Precio Venta', flex: .5, valueFormatter: (params) => (utils.renderMoneystr(params.value)) },
        { field: 'purchase', headerName: 'Precio Compra', flex: .5, valueFormatter: (params) => (utils.renderMoneystr(params.value)) },
        {
            field: 'actions',
            headerName: '',
            type: 'actions', flex: .5, getActions: (params) => [
                <GridActionsCellItem
                    label='delete'
                    icon={<DeleteIcon />}
                    onClick={() => {
                        setRowData({
                            rowId: params.id,
                            id: params.row.id,
                            name: params.row.name,
                            code: params.row.code,
                            sale: params.row.sale,
                            oldSale: params.row.sale,
                            purchase: params.row.purchase,
                            oldPurchase: params.row.purchase,
                            price_id: params.row.price_id,
                            tax: params.row.tax,
                            tax_id: params.row.tax_id,
                            category: params.row.category,
                            category_id: params.row.category_id
                        })
                        setOpenDestroyDialog(true)
                    }}
                />,
                <GridActionsCellItem
                    label='view'
                    icon={<InfoIcon />}
                    onClick={() => {
                        setRowData({
                            rowId: params.id,
                            id: params.row.id,
                            name: params.row.name,
                            code: params.row.code,
                            sale: params.row.sale,
                            oldSale: params.row.sale,
                            purchase: params.row.purchase,
                            oldPurchase: params.row.purchase,
                            price_id: params.row.price_id,
                            tax: params.row.tax,
                            tax_id: params.row.tax_id,
                            category: params.row.category,
                            category_id: params.row.category_id,
                            salesRoomStock: params.row.salesRoomStock
                        })
                        setOpenInfoDialog(true)
                    }}
                />,
                ,
                <GridActionsCellItem
                    label='view'
                    icon={params.row.favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    onClick={() => {
                        updateFavorite(params.id, !params.row.favorite)
                    }}
                />
            ]
        }
    ]



    return (
        <>
            <AppDataGrid title='Productos' rows={productsList} columns={columns} height='80vh' setGridApiRef={setGridApiRef} />
            <Dialog open={openInfoDialog} maxWidth={'md'} fullWidth>

                <DialogTitle sx={{ p: 2 }}>
                    Información producto
                </DialogTitle>
                <DialogContent sx={{ p: 2 }}>
                <Grid container spacing={1}>
                    <Grid item xs={4}>
                        <AppPaper title={'Actualizar'}>
                            <form onSubmit={(e) => { e.preventDefault(); updateProduct() }}>
                                    <Grid container spacing={1} direction={'column'} padding={1}>
                                        <Grid item>
                                            <TextField
                                                label="Nombre"
                                                value={rowData.name}
                                                onChange={(e) => { setRowData({ ...rowData, name: e.target.value }) }}
                                                variant="outlined"
                                                size={'small'}
                                                fullWidth
                                                required
                                            />
                                        </Grid>
                                        <Grid item>
                                            <TextField
                                                label="Precio de venta"
                                                value={(rowData.sale == undefined) ? '' : utils.renderMoneystr(rowData.sale)}
                                                onChange={(e) => { setRowData({ ...rowData, sale: e.target.value }) }}
                                                variant="outlined"
                                                size={'small'}
                                                fullWidth
                                                required
                                            />
                                        </Grid>
                                        <Grid item>
                                            <TextField
                                                label="Precio de compra"
                                                value={(rowData.purchase == undefined) ? '' : utils.renderMoneystr(rowData.purchase)}
                                                onChange={(e) => { setRowData({ ...rowData, purchase: e.target.value }) }}
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
                                                value={rowData.category}
                                                onChange={(e, newValue) => {
                                                    setRowData({ ...rowData, category: newValue })
                                                }}
                                                disablePortal
                                                options={categoriesOptions}
                                                renderInput={(params) => <TextField {...params} label='Categoría' size={'small'} fullWidth required />}
                                            />
                                        </Grid>
                                        <Grid item>
                                            <TextField
                                                label="Stock en sala"
                                                value={rowData.salesRoomStock}
                                                onChange={(e) => { setRowData({ ...rowData, salesRoomStock: e.target.value }) }}
                                                variant="outlined"
                                                size={'small'}
                                                fullWidth
                                                required
                                            />
                                        </Grid>
                                        <Grid item>
                                            <TextField
                                                label="Código"
                                                value={rowData.code}
                                                onChange={(e) => { setRowData({ ...rowData, code: e.target.value }) }}
                                                variant="outlined"
                                                size={'small'}
                                                fullWidth
                                                required
                                            />
                                        </Grid>
                                        <Grid item>
                                            <Button variant={'contained'} type={'submit'}>Actualizar</Button>
                                        </Grid>
                                    </Grid>
                              
                            </form>
                        </AppPaper>
                    </Grid>

                    <Grid item xs={8}>
                        <StockController productId={rowData.id}/>
                    </Grid>
                </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>

                    <Button variant={'outlined'} onClick={() => setOpenInfoDialog(false)}>Cerrar</Button>
                </DialogActions>


            </Dialog>

            <Dialog open={openDestroyDialog} maxWidth={'xs'} fullWidth>
                <DialogTitle sx={{ p: 2 }}>
                    Eliminar producto
                </DialogTitle>
                <form onSubmit={(e) => { e.preventDefault(); destroy() }}>
                    <DialogContent sx={{ p: 2 }}>
                        <Grid container spacing={1} direction={'column'}>
                            <Grid item marginTop={1}>
                                <TextField
                                    label="Id"
                                    value={rowData.id}
                                    inputProps={{ readOnly: true }}
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    label="Nombre"
                                    value={rowData.name}
                                    inputProps={{ readOnly: true }}
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                />
                            </Grid>

                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button variant={'contained'} type={'submit'}>Eliminar</Button>
                        <Button variant={'outlined'} onClick={() => setOpenDestroyDialog(false)}>Cerrar</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    )
}


function rowDataDefault() {
    return {
        id: 0,
        name: '',
        code: '',
        sale: '',
        oldSale: '',
        purchase: '',
        oldPurchase: '',
        price_id: 0,
        tax: '',
        tax_id: 0,
        category: '',
        category_id: 0,
        favorite: false,
        salesRoomStock: 0
    }
}