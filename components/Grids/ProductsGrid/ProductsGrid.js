import React, { useEffect, useState } from 'react'
import AppDataGrid from '../../AppDataGrid'
import { GridActionsCellItem } from '@mui/x-data-grid'
import DeleteIcon from '@mui/icons-material/Delete'
import InfoIcon from '@mui/icons-material/Info'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import WidgetsOutlinedIcon from '@mui/icons-material/WidgetsOutlined'
import WidgetsIcon from '@mui/icons-material/Widgets'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, Autocomplete, FormControl, FormControlLabel, Switch } from '@mui/material'
import AppPaper from '../../AppPaper/AppPaper'
import StockController from '../../StockController/StockController'
import ViewWeekIcon from '@mui/icons-material/ViewWeek'
import electron from 'electron'
import moment from 'moment'
import { useAppContext } from '../../../AppProvider'
const ipcRenderer = electron.ipcRenderer || false





const products = require('../../../promises/products')
const categories = require('../../../promises/categories')
const taxes = require('../../../promises/taxes')
const utils = require('../../../utils')
const prices = require('../../../promises/prices')
const stocks = require('../../../promises/stocks')



export default function ProductsGrid(props) {
    const { update } = props
    const { cart, dispatch, openSnack } = useAppContext()
    const [gridApiRef, setGridApiRef] = useState(null)
    const [rowData, setRowData] = useState(rowDataDefault())
    const [productsList, setProductsList] = useState([])
    const [openInfoDialog, setOpenInfoDialog] = useState(false)
    const [categoriesOptions, setCategoriesOptions] = useState([])
    const [categoriesInput, setCategoriesInput] = useState('')
    const [taxesOptions, setTaxesOptions] = useState([])
    const [taxesInput, settaxesInput] = useState('')
    const [openDestroyDialog, setOpenDestroyDialog] = useState(false)
    const [printer, setPrinter] = useState({ idProduct: 0, idVendor: 0 })

    useEffect(() => {
        let printer = ipcRenderer.sendSync('get-printer', 'sync')
        setPrinter(printer)
    }, [])

    useEffect(() => {
        products.findAll().then(res => {
            let data = res.map((item) => ({
                id: item.id,
                name: item.name,
                code: item.code,
                sale: item.sale,
                purchase: item.purchase,
                tax_id: item.tax_id,
                category: item.Category != undefined ? item.Category.name : '',
                category_id: item.Category != undefined ? item.Category.id : '',
                favorite: item.favorite,
                stock: item.Stocks.reduce((accumulator, currentValue) => { return accumulator + currentValue.stock; }, 0),
                salesRoomStock: item.Stocks.find(item => (item.storage_id == 1001)) == undefined ? 0 : item.Stocks.find(item => (item.storage_id == 1001)).stock,
                stock_control: item.stock_control,
                affected: item.affected,
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

    const updateStockControl = (rowId, stock_control) => {
        products.updateStockControl(rowId, stock_control)
            .then(() => {
                gridApiRef.current.updateRows([{ id: rowId, stock_control: stock_control }])
            })
            .catch(err => { console.error(err) })
    }

    const updateProduct = (e) => {
        console.log(rowData)
        products.updateFull(
            rowData.id,
            rowData.name,
            rowData.code,
            rowData.category.id,
            1001,
            rowData.sale,
            rowData.purchase,
            rowData.affected,
        )
            .then(() => {
                gridApiRef.current.updateRows([{
                    id: rowData.rowId,
                    name: rowData.name,
                    code: rowData.code,
                    category: rowData.category.label,
                    sale: rowData.sale,
                    purchase: rowData.purchase,
                    affected: rowData.affected,
                }])
                setOpenInfoDialog(false)

            })
            .catch(err => { console.error(err) })
    }

    const destroy = () => {
        products.destroy(rowData.id)
            .then(() => {
                gridApiRef.current.updateRows([{ id: rowData.rowId, _action: 'delete' }])
                setOpenDestroyDialog(false)
            })
            .catch(err => { console.error(err) })
    }

    const printCode = async (productName, amount, code) => {

        const findPrinter_1 = await ipcRenderer.invoke('find-printer', printer)
        if (!findPrinter_1) {
            dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'Error de conexión con la impresora' } })
        } else {
            let printInfo = {
                printer: printer,
                amount: amount,
                productName: productName,
                code: code
            }

            ipcRenderer.sendSync('code', printInfo)
        }
    }


    const columns = [
        { field: 'id', headerName: 'Id', flex: .3, type: 'number', hide: true },
        { field: 'name', headerName: 'Nombre', flex: .9 },
        { field: 'code', headerName: 'Código', flex: .4 },
        { field: 'category', headerName: 'Categoría', flex: .5 },
        { field: 'affected', headerName: 'Afecto', flex: .4, type: 'boolean', hide: false },
        { field: 'salesRoomStock', headerName: 'Stock sala', flex: .4 },
        { field: 'stock', headerName: 'Stock total', flex: .4 },
        { field: 'sale', headerName: '$ Venta', type: 'number', flex: .45, valueFormatter: (params) => (utils.renderMoneystr(params.value)) },
        { field: 'purchase', headerName: '$ Compra', flex: .4, type: 'number', valueFormatter: (params) => (utils.renderMoneystr(params.value)) },
        {
            field: 'actions',
            headerName: '',
            headerClassName: 'data-grid-last-column-header',
            type: 'actions', flex: .8, getActions: (params) => [
                <GridActionsCellItem
                    sx={{ mt: .5, mb: .5, ml: 0, mr: 0, p: 0 }}
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
                            category: { label: params.row.category, id: params.row.category_id, key: params.row.category_id },
                            category_id: params.row.category_id
                        })
                        setOpenDestroyDialog(true)
                    }}
                />,
                <GridActionsCellItem
                    sx={{ mt: .5, mb: .5, ml: 0, mr: 0, p: 0 }}
                    label='view'
                    icon={<InfoIcon />}
                    onClick={() => {
                        let profitMoney = ((params.row.sale) - (params.row.purchase)) / 1.19
                        let saleNet = params.row.sale / 1.19
                        let purchaseNet = params.row.purchase / 1.19

                        let profit = ((saleNet - purchaseNet) / saleNet) * 100
                        profit = parseInt(profit)
                        purchaseNet = parseInt(purchaseNet)

                        setRowData({
                            rowId: params.id,
                            id: params.row.id,
                            name: params.row.name,
                            code: params.row.code,
                            purchaseNet: purchaseNet,
                            profit: profit,
                            sale: params.row.sale,
                            oldSale: params.row.sale,
                            purchase: params.row.purchase,
                            oldPurchase: params.row.purchase,
                            price_id: params.row.price_id,
                            tax: params.row.tax,
                            tax_id: params.row.tax_id,
                            category: { label: params.row.category, id: params.row.category_id, key: params.row.category_id },
                            category_id: params.row.category_id,
                            salesRoomStock: params.row.salesRoomStock,
                            stock: params.row.stock,
                            affected: params.row.affected,
                        })
                        setOpenInfoDialog(true)
                    }}
                />,
                ,
                <GridActionsCellItem
                    sx={{ mt: .5, mb: .5, ml: 0, mr: 0, p: 0 }}
                    label='view'
                    icon={params.row.favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    onClick={() => {
                        updateFavorite(params.id, !params.row.favorite)
                    }}
                />,
                <GridActionsCellItem
                    sx={{ mt: .5, mb: .5, ml: 0, mr: 0, p: 0 }}
                    label='stock control'
                    icon={params.row.stock_control ? <WidgetsIcon /> : <WidgetsOutlinedIcon />}
                    onClick={() => {
                        updateStockControl(params.id, !params.row.stock_control)
                    }}
                />,
                <GridActionsCellItem
                    sx={{ mt: .5, mb: .5, ml: 0, mr: 0, p: 0 }}
                    label='code'
                    icon={<ViewWeekIcon />}
                    onClick={() => {
                        printCode(params.row.name, params.row.sale, params.row.code)
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
                                                label="Utilidad"
                                                value={rowData.profit}
                                                type='number'
                                                onChange={(e) => {
                                                    if (rowData.profit != 0 || rowData.purchaseNet != 0) {
                                                        let profit = e.target.value
                                                        let purchase = parseInt(rowData.purchaseNet * 1.19)
                                                        let sale = parseInt((rowData.purchaseNet / (1 - (profit / 100))) * 1.19)
                                                        setRowData({
                                                            ...rowData,
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
                                                value={utils.renderMoneystr(rowData.purchaseNet)}
                                                onChange={(e) => {
                                                    let value = e.target.value === '' ? 0 : utils.moneyToInt(e.target.value)
                                                    let purchase = parseInt(value * 1.19)
                                                    let sale = parseInt((value / (1 - (rowData.profit / 100))) * 1.19)
                                                    setRowData({
                                                        ...rowData,
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
                                                label="Precio de compra"
                                                value={(rowData.purchase == undefined) ? '' : utils.renderMoneystr(rowData.purchase)}
                                                onChange={(e) => { e.target.value === '$ ' || e.target.value === '$' || e.target.value === '0' || e.target.value === '' ? setRowData({ ...rowData, purchase: 0 }) : setRowData({ ...rowData, purchase: utils.moneyToInt(e.target.value) }) }}
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
                                                onChange={(e) => { e.target.value === '$ ' || e.target.value === '$' || e.target.value === '0' || e.target.value === '' ? setRowData({ ...rowData, sale: 0 }) : setRowData({ ...rowData, sale: utils.moneyToInt(e.target.value) }) }}
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
                                            <FormControl>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={rowData.affected}
                                                            onChange={() => { setRowData({ ...rowData, affected: !rowData.affected }) }}
                                                            name="affected"
                                                            color="primary"
                                                        />
                                                    }
                                                    label="Venta afecta"
                                                />
                                            </FormControl>
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
                                        <Grid item textAlign={'right'}>
                                            <Button variant={'contained'} type={'submit'}>Actualizar</Button>
                                        </Grid>
                                    </Grid>
                                </form>
                            </AppPaper>
                        </Grid>

                        <Grid item xs={8}>
                            <StockController productId={rowData.id} gridApiRef={gridApiRef} />
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
        purchaseNet: '',
        profit: 30,
        sale: '',
        oldSale: '',
        purchase: '',
        oldPurchase: '',
        price_id: 0,
        tax: '',
        tax_id: 0,
        category: { key: 0, label: '', id: 0 },
        category_id: 0,
        favorite: false,
        salesRoomStock: 0,
        stock: 0
    }
}