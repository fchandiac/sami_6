import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, Paper, Typography, TextField,
    FormGroup, FormControlLabel, Checkbox, Autocomplete, RadioGroup, Radio, IconButton, Box
} from '@mui/material'
import {
    DataGrid,
    esES,
    GridToolbarQuickFilter,
    useGridApiContext,
    useGridSelector,
    gridPageSelector,
    gridPageCountSelector,
} from '@mui/x-data-grid'
import { ThemeProvider } from '@mui/material/styles'
import { styled } from '@mui/system'
import React, { useState, useEffect, useRef, forwardRef } from 'react'

import AddCircleIcon from '@mui/icons-material/AddCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'
import LockOpenTwoToneIcon from '@mui/icons-material/LockOpenTwoTone'
import LockTwoToneIcon from '@mui/icons-material/LockTwoTone'
import ReceiptIcon from '@mui/icons-material/Receipt'
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle'
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined'
import EditIcon from '@mui/icons-material/Edit'
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart'
import { GridActionsCellItem } from '@mui/x-data-grid'
import { useAppContext } from '../../AppProvider'
import AppPaper from '../AppPaper/AppPaper'
import PayDialog from './PayDialog/PayDialog'



import electron from 'electron'
const ipcRenderer = electron.ipcRenderer || false

const utils = require('../../utils')
const print = require('../../promises/print')
const ordersPr = require('../../promises/orders')
const ordersDetails = require('../../promises/ordersDetails')
const products = require('../../promises/products')


export default function ShoppingCart(props) {
    const { stockControl, quote } = props
    const { cart, total, lock, dispatch, ordersMode, ordersInCart, openSnack } = useAppContext()
    const [rowData, setRowData] = useState(rowDataDefault())
    const [openPayDialog, setOpenPayDialog] = useState(false)
    const [openNewCustomerDialog, setOpenNewCustomerDialog] = useState(false)
    const [openEditQuantyDialog, setOpenEditQuantyDialog] = useState(false)
    const [openDiscountDialog, setOpenDiscountDialog] = useState(false)
    const [discount, setDiscount] = useState(0)
    const [printerInfo, setPrinterInfo] = useState({ idProduct: 0, idVendor: 0 })
    const [ticketInfo, setTicketInfo] = useState({ name: '', address: '', phone: '', rut: '' })
    const [openSpecialProductDialog, setOpenSpecialProductDialog] = useState(false)
    const [specialProduct, setSpecialProduct] = useState(specialProductDefault())
    const [orders, setOrders] = useState(false)
    const [rowDiscountAmount, setRowDiscountAmount] = useState(0)
    const rowDiscountAmountRef = useRef(null)
    const [openDiscountAmountDialog, setOpenDiscountAmountDialog] = useState(false)


    useEffect(() => {
        let print_info = ipcRenderer.sendSync('get-printer', 'sync')
        let ticket_info = ipcRenderer.sendSync('get-ticket-info', 'sync')
        let UI = ipcRenderer.sendSync('get-cash-register-UI', 'sync')
        setPrinterInfo(print_info)
        setTicketInfo(ticket_info)
        setOrders(UI.orders)
    }, [])

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "+") {
                if (ordersMode === true) {
                    if (cart.length === 0) {
                        dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'No hay productos en el carrito' } })
                    } else {
                        newOrder()
                    }

                } else {
                    if (cart.length === 0) {
                        dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'No hay productos en el carrito' } })
                    } else {

                        setOpenPayDialog(true)
                    }
                }
            }
        }
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        }
    }, [cart])

    const showNewOrderButton = () => {
        if (orders === true && ordersMode === true) {
            return true
        } else if (orders === true && ordersMode === false) {
            return true
        } else if (orders === false && ordersMode === false) {
            return false
        } else if (orders === false && ordersMode === true) {
            return true
        }
    }

    const removeProduct = (id, salesRoomStock) => {
        dispatch({ type: 'REMOVE_FROM_CART', value: { id, salesRoomStock } })
    }

    const substractProduct = (id, salesRoomStock) => {
        dispatch({ type: 'SUBSTRACT_QUANTY', value: { id, salesRoomStock } })
    }

    const addProduct = (id, salesRoomStock) => {
        let product = cart.find((product) => product.id === id)
        if (product.stockControl === false) {
            dispatch({ type: 'ADD_QUANTY', value: { id, salesRoomStock } })
        } else {
            if (product.virtualStock <= 0) {
                dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'No hay stock disponible' } })
            } else {
                dispatch({ type: 'ADD_QUANTY', value: { id, salesRoomStock } })
            }
        }


    }

    const editQuanty = () => {
        if (rowData.quanty == 0) {
            dispatch({ type: 'REMOVE_FROM_CART', value: { id: rowData.id, salesRoomStock: rowData.salesRoomStock } })
            setOpenEditQuantyDialog(false)
        } else {
            if (rowData.stockControl === true) {
                if (stockControl == true && rowData.quanty > rowData.salesRoomStock) {
                    dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'No hay stock suficiente' } })
                } else {
                    dispatch({ type: 'EDIT_QUANTY', value: { id: rowData.id, quanty: rowData.quanty } })
                    setOpenEditQuantyDialog(false)
                }
            } else {
                dispatch({ type: 'EDIT_QUANTY', value: { id: rowData.id, quanty: rowData.quanty } })
                setOpenEditQuantyDialog(false)
            }

        }
    }

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' })
        dispatch({ type: 'SET_ORDERS_IN_CART', value: [] })
    }

    const addDiscount = (id) => {
        dispatch({ type: 'ADD_DISCOUNT', value: id })
    }

    const setRowDiscount = () => {
        dispatch({ type: 'SET_DISCOUNT', value: { id: rowData.id, amount: rowDiscountAmount } })
        setRowDiscountAmount(0)
        setOpenDiscountAmountDialog(false)
    }

    const substractDiscount = (id) => {
        dispatch({ type: 'SUBSTRACT_DISCOUNT', value: id })
    }

    const proccessPayment = () => {
        if (cart.length === 0) {
            dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'No hay productos en el carrito' } })
            return

        } else {
            setOpenPayDialog(true)
        }
    }


    const openDiscountUI = () => {
        if (cart.length === 0) {
            dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'No hay productos en el carrito' } })
        } else {
            setOpenDiscountDialog(true)
        }
    }

    const openSpecialProductUI = () => {
        setOpenSpecialProductDialog(true)
    }

    const applyDiscount = (discount) => {
        dispatch({ type: 'GLOBAL_DISCOUNT', value: discount })
        setOpenDiscountDialog(false)
    }


    const printQuote = () => {
        if (cart.length === 0) {
            dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'No hay productos en el carrito' } })
        } else {
            print.quote(total, cart, ticketInfo, printerInfo)
                .then(() => {
                    dispatch({ type: 'CLEAR_CART' })
                })
                .catch((err) => {
                    console.log('imprimiendo', printerInfo)
                    console.log(err)
                    dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'Error de conexión con la impresora' } })
                })


        }

    }

    const addSpecialProduct = () => {
        console.log(specialProduct.quanty * specialProduct.sale)
        let id = Math.floor(Math.random() * (99999 - 20000 + 1)) + 900000
        let quanty = parseFloat(specialProduct.quanty)
        let subTotal = quanty * specialProduct.sale
        let specialPro = {
            id: id,
            name: specialProduct.name,
            quanty: quanty,
            sale: specialProduct.sale,
            subTotal: subTotal,
            affected: true,
            salesRoomStock: 1,
            virtualStock: 1,
            discount: 0,
            controlStock: false,
            code: '0001SP' + Math.floor(Math.random() * 1000).toString(),
            specialProduct: true
        }
        dispatch({ type: 'ADD_SPECIAL_TO_CART', value: specialPro })
        setOpenSpecialProductDialog(false)
        setSpecialProduct(specialProductDefault())

    }

    const orderDetailsPrAll = (order_id) => {
        let details = []
        cart.map((product) => {
            details.push(
                ordersDetails.create(
                    order_id,
                    product.id,
                    product.quanty,
                    product.sale,
                    product.discount,
                    product.subTotal,
                    product.name,
                    product.affected
                ))
        })

        return Promise.all(details)
    }

    const newOrder2 = async () => {
        if (cart.length === 0) {
            dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'No hay productos en el carrito' } })
        } else {
            const findPrinter = await ipcRenderer.invoke('find-printer', printerInfo)
            if (findPrinter) {
                ordersPr.create()
                    .then((res) => {
                        let order_id = res.id
                        orderDetailsPrAll(res.id)
                            .then(() => {
    
                                dispatch({ type: 'OPEN_SNACK', value: { type: 'success', message: 'Pedido creado' } })
                                ipcRenderer.invoke('find-printer', printerInfo)
                                    .then((findPrinter) => {
                                        if (!findPrinter) {
                                            dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'Error de conexión con la impresora' } })
                                        } else {
                                            let printinfo = {
                                                printer: printerInfo,
                                                total: total,
                                                order_id: order_id,
                                            }
                                            ipcRenderer.send('simple-order', printinfo)
                                        }
                                    })
                                    dispatch({ type: 'CLEAR_CART' })
                            })
                            .catch((err) => {
                                console.log(err)
                                dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'Error al crear el pedido' } })
                            })
                    })
                    .catch((err) => { console.log(err) })
            } else {
                dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'Error de conexión con la impresora' } })
            }
        }
    }

    const newOrder = async () => {console.log('TOTAL', total)}

    const newOrder3 = async () => {
        if (cart.length === 0) {
            openSnack('error', 'No hay productos en el carrito')
            return
        }
        console.log('TOTAL', total)
        const findPrinter = await ipcRenderer.invoke('find-printer', printerInfo)
        if (!findPrinter) { // quitar!
            
            const newOrder = await ordersPr.create()
            let printinfo = {
                printer: printerInfo,
                total: total,
                order_id: newOrder.id,
            }
            await orderDetailsPrAll(newOrder.id)
            ipcRenderer.send('simple-order', printinfo)
            openSnack('success', 'Pedido creado')
            clearCart()
        } else {
            openSnack('error', 'Error de conexión con la impresora')
            return
        }
        console.log('TOTAL', total)


    }

    const removeOrder = async (id) => {
        try {
            const orderToRemove = await ordersPr.findOneById(id)
            let details = orderToRemove.ordersdetails
            console.log('Details')
            console.log(details)
            // console.log('Cart')
            for (const item of details) {
                const product = await products.findOneById(item.product_id);
                if (product == null) {
                    let findProduct = cart.find(product => product.name === item.name)
                    let id = findProduct.id
                    let st = 0
                    dispatch({ type: 'REMOVE_FROM_CART', value: { id, st } })
                } else {
                    let cartProduct = cart.find(product => product.id === item.product_id)
                    let quanty = cartProduct.quanty - item.quanty
                    if (quanty == 0) {
                        dispatch({ type: 'REMOVE_FROM_CART', value: { id: cartProduct.id, salesRoomStock: cartProduct.salesRoomStock } })
                    } else {
                        dispatch({ type: 'EDIT_QUANTY', value: { id: cartProduct.id, quanty: quanty } })
                    }
                }
            }

            let newOrders = ordersInCart.filter(item => item.order_id != orderToRemove.id)
            console.log('ORDERS_IN_CART', newOrders)
            dispatch({ type: 'SET_ORDERS_IN_CART', value: newOrders })
        } catch (err) {

            let newOrders = ordersInCart.filter(item => item.order_id != id)
            console.log('ORDERS_IN_CART', newOrders)
            dispatch({ type: 'SET_ORDERS_IN_CART', value: newOrders })
            console.log(err)
        }

    }


    const columns = [
        { field: 'quanty', headerName: '#', flex: .3 },
        { field: 'name', headerName: 'Producto', flex: 1.5 },
        { field: 'sale', headerName: 'Precio', flex: .8, valueFormatter: (params) => (utils.renderMoneystr(params.value)) },
        {
            field: 'discount',
            headerName: 'Descuento',
            flex: 1.1,
            renderCell: (params) => (
                <>
                    <Box sx={{ alignItems: 'center' }}>
                        <IconButton
                            sx={{ mt: .5, mb: .5, ml: 0, mr: .5, p: 0 }}
                            onClick={() => { substractDiscount(params.row.id) }}>
                            <RemoveCircleOutlineOutlinedIcon fontSize='small' />
                        </IconButton>
                        {(params.row.discount).toString().slice(0, 4) + '%'}
                        <IconButton
                            sx={{ mt: .5, mb: .5, ml: .5, mr: 1, p: 0 }}
                            onClick={() => { addDiscount(params.row.id) }}>
                            <AddCircleOutlineOutlinedIcon fontSize='small' />
                        </IconButton>
                        <br />
                        {utils.renderMoneystr(params.row.discountAmount)}
                        <IconButton
                            sx={{ mt: .5, mb: .5, ml: .5, mr: 0, p: 0 }}
                            onClick={() => {
                                setRowData({
                                    ...rowData,
                                    id: params.row.id,
                                })
                                setOpenDiscountAmountDialog(true)
                            }}>
                            <EditIcon fontSize='small' />
                        </IconButton>
                    </Box>


                </>
            ),
            hide: lock ? true : false
        },
        { field: 'subTotal', headerName: 'Subtotal', flex: .8, valueFormatter: (params) => (utils.renderMoneystr(params.value)) },
        {
            field: 'actions',
            headerName: '',
            flex: 1.2,
            headerClassName: 'data-grid-last-column-header',
            type: 'actions', getActions: (params) => [
                <GridActionsCellItem
                    sx={{ mt: .5, mb: .5, ml: 0, mr: 0, p: 0 }}
                    label='delete'
                    icon={<DeleteIcon />}
                    onClick={() => {
                        removeProduct(params.row.id, params.row.salesRoomStock)
                    }}
                />,
                <GridActionsCellItem
                    sx={{ mt: .5, mb: .5, ml: 0, mr: 0, p: 0 }}
                    label='substract'
                    icon={<RemoveCircleIcon />}
                    onClick={() => {
                        substractProduct(params.row.id, params.row.salesRoomStock)
                    }}
                />,
                <GridActionsCellItem
                    sx={{ mt: .5, mb: .5, ml: 0, mr: 0, p: 0 }}
                    label='edit'
                    icon={<EditIcon />}
                    onClick={() => {
                        setRowData({
                            id: params.row.id,
                            quanty: '',
                            salesRoomStock: params.row.salesRoomStock,
                            name: params.row.name,
                            stockControl: params.row.stockControl

                        })
                        setOpenEditQuantyDialog(true)
                    }}
                />,
                <GridActionsCellItem
                    sx={{ mt: .5, mb: .5, ml: 0, mr: 0, p: 0 }}
                    label='add'
                    icon={<AddCircleIcon />}
                    onClick={() => {
                        addProduct(params.row.id, params.row.salesRoomStock)
                    }}
                />,

            ]
        }
    ]





    return (
        <>
            <Paper elevation={0} variant="outlined" sx={{ height: '100%' }}>
                <DataGrid
                    localeText={esESGrid}
                    sx={{ border: 'none' }}
                    disableColumnMenu
                    rows={[...cart].reverse()}
                    density='compact'
                    getRowHeight={() => 'auto'}
                    columns={columns}
                    components={{ Toolbar: CustomToolbar, Pagination: CustomFooter }}
                    componentsProps={{
                        toolbar: {
                            total: utils.renderMoneystr(total),
                            ordersInCart: ordersInCart,
                            removeOrder: removeOrder

                        },
                        pagination: {
                            lock: lock,
                            quote: quote,
                            printQuote: printQuote,
                            proccessPayment: proccessPayment,
                            openDiscountUI: openDiscountUI,
                            clearCart: clearCart,
                            ordersMode: ordersMode,
                            openSpecialProductUI: openSpecialProductUI,
                            showNewOrderButton: showNewOrderButton,
                            newOrder: newOrder2
                        }
                    }}
                />

            </Paper>

            <PayDialog open={openPayDialog} setOpen={setOpenPayDialog} total={total} stockControl={stockControl} />

            <Dialog open={openEditQuantyDialog} fullWidth maxWidth={'xs'}>
                <DialogTitle sx={{ p: 2 }}>
                    Editar cantidad:
                    <Typography variant='subtitle2' sx={{ ml: 1 }}>
                        Producto: {rowData.name}
                    </Typography>
                </DialogTitle>
                <form onSubmit={(e) => { e.preventDefault(); editQuanty(rowData.id, rowData.quanty) }}>
                    <DialogContent sx={{ p: 2 }}>
                        <Grid container spacing={1} direction={'column'}>
                            <Grid item>
                                <TextField
                                    label="Cantidad"
                                    value={rowData.quanty}
                                    onChange={(e) => { setRowData({ ...rowData, quanty: e.target.value }) }}
                                    type="number"
                                    inputProps={{ step: "0.01", min: 0 }}
                                    variant="outlined"
                                    size={'small'}
                                    autoFocus
                                    fullWidth
                                    required
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button variant="contained" type='submit'>Editar</Button>
                        <Button variant={'outlined'} onClick={() => setOpenEditQuantyDialog(false)}>Cerrar</Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={openDiscountDialog} fullWidth maxWidth={'xs'}>
                <DialogTitle sx={{ p: 2 }}>Aplicar descuento global</DialogTitle>
                <form onSubmit={(e) => { e.preventDefault(); applyDiscount(discount) }}>
                    <DialogContent sx={{ p: 2 }}>
                        <Grid container spacing={1} direction={'column'}>
                            <Grid item marginTop={1}>
                                <TextField
                                    label="Descuento"
                                    value={discount}
                                    onChange={(e) => { setDiscount(e.target.value) }}
                                    type="number"
                                    inputProps={{ max: 100, min: 0 }}
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                    required
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button variant="contained" type='submit'>aplicar</Button>
                        <Button variant={'outlined'} onClick={() => { setOpenDiscountDialog(false) }}>cerrar</Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={openSpecialProductDialog} maxWidth={'xs'} fullWidth>
                <DialogTitle sx={{ p: 2 }}>
                    Producto Especial
                </DialogTitle>
                <form onSubmit={(e) => { e.preventDefault(); addSpecialProduct() }}>
                    <DialogContent sx={{ p: 2 }}>
                        <Grid container spacing={1} direction={'column'}>

                            <Grid item>
                                <TextField
                                    label="Nombre"
                                    value={specialProduct.name}
                                    onChange={(e) => { setSpecialProduct({ ...specialProduct, name: e.target.value }) }}
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                    autoFocus
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    label="Cantidad"
                                    value={specialProduct.quanty}
                                    onChange={(e) => { setSpecialProduct({ ...specialProduct, quanty: e.target.value }) }}
                                    type="number"
                                    inputProps={{ step: "0.01", min: 1 }}
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    label="Precio"
                                    value={utils.renderMoneystr(specialProduct.sale)}
                                    onChange={(e) => { e.target.value === '$ ' || e.target.value === '$' || e.target.value === '0' || e.target.value === '' ? setSpecialProduct({ ...specialProduct, sale: 0 }) : setSpecialProduct({ ...specialProduct, sale: utils.moneyToInt(e.target.value) }) }}
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button variant={'contained'} type={'submit'}>Agregar</Button>
                        <Button variant={'outlined'} onClick={() => setOpenSpecialProductDialog(false)}>Cerrar</Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={openDiscountAmountDialog} fullWidth maxWidth={'xs'}>
                <DialogTitle sx={{ p: 2 }}>Descuento por monto</DialogTitle>
                <form onSubmit={(e) => { e.preventDefault(); setRowDiscount() }}>
                    <DialogContent sx={{ p: 2 }}>
                        <Grid container spacing={1} direction={'column'}>
                            <Grid item marginTop={1}>
                                <TextField
                                    label="Monto descuento"
                                    value={utils.renderMoneystr(rowDiscountAmount)}
                                    onChange={(e) => { e.target.value === '$ ' || e.target.value === '$' || e.target.value === '0' || e.target.value === '' ? setRowDiscountAmount(0) : setRowDiscountAmount(utils.moneyToInt(e.target.value)) }}
                                    name='discountAmount'
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                    autoFocus
                                    required
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button variant="contained" type='submit'>aplicar</Button>
                        <Button variant={'outlined'} onClick={() => { setOpenDiscountAmountDialog(false) }}>cerrar</Button>
                    </DialogActions>
                </form>
            </Dialog>

        </>
    )
}

function rowDataDefault() {
    return ({
        id: 0,
        name: '',
        quanty: 1,
        sale: 0,
        subTotal: 0,
        salesRoomStock: 0,
        virtualStock: 0,
        discount: 0,
        controlStock: false,
        code: '0001' + Math.floor(Math.random() * 1000).toString()
    })
}

function specialProductDefault() {
    return ({
        id: 0,
        name: '',
        quanty: 1,
        sale: 0,
        subTotal: 0,
        salesRoomStock: 0,
        virtualStock: 0,
        discount: 0,
        controlStock: false,
        code: '0001' + Math.floor(Math.random() * 1000).toString()
    })
}


function CustomToolbar(props) {
    const { total, ordersInCart, removeOrder } = props



    return (
        <Box sx={{ p: 2, m: 1 }}>
            <Typography variant="h5" gutterBottom component="div">{'Total: ' + total}</Typography>
            {ordersInCart.map((order, index) => (
                <Button
                    key={index}
                    variant={'outlined'}
                    startIcon={<ReceiptIcon />}
                    endIcon={<DeleteIcon />}
                    onClick={() => { removeOrder(order.order_id) }}
                    size={'small'}
                    sx={{ mr: .5, mt: .5 }}

                >
                    {order.order_id}
                </Button>

            ))}
        </Box>
    )
}

function CustomFooter(props) {
    const {
        lock,
        proccessPayment,
        openDiscountUI,
        clearCart,
        quote,
        printQuote,
        ordersMode,
        openSpecialProductUI,
        showNewOrderButton,
        newOrder
    } = props




    return (
        <>
            <Grid container spacing={1} direction={'row'} justifyContent={'flex-end'} paddingRight={1}>
                <Grid item>
                    <IconButton onClick={() => { openSpecialProductUI() }}>
                        <LibraryAddIcon />
                    </IconButton>
                </Grid>
                <Grid item>
                    <Button
                        sx={{ display: ordersMode ? 'none' : 'inline-flex' }}
                        variant="contained"
                        onClick={() => { proccessPayment() }}>
                        Procesar Pago
                    </Button>
                </Grid>
                <Grid item>
                    <Button
                        sx={{ display: showNewOrderButton ? 'inline-flex' : 'none' }}
                        variant={ordersMode ? 'contained' : 'outlined'}
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={() => { newOrder() }}>
                        Pedido
                    </Button>
                </Grid>
                <Grid item>
                    <Button variant={'outlined'} sx={{ display: quote ? 'inline-flex' : 'none' }} onClick={() => { printQuote() }}>Cotización</Button>
                </Grid>
                <Grid item>
                    <Button variant={'outlined'} sx={{ display: lock ? 'none' : 'inline-flex' }} onClick={() => { openDiscountUI() }}>Descuento</Button>
                </Grid>
                <Grid item>
                    <IconButton onClick={() => { clearCart() }}><RemoveShoppingCartIcon /></IconButton>
                </Grid>
            </Grid>

        </>
    )
}

const esESGrid = {
    // Root
    noRowsLabel: 'Sin productos',
    noResultsOverlayLabel: 'Ningún resultado encontrado.',
    errorOverlayDefaultLabel: 'Ha ocurrido un error.',
    // Density selector toolbar button text
    toolbarDensity: 'Densidad',
    toolbarDensityLabel: 'Densidad',
    toolbarDensityCompact: 'Compacta',
    toolbarDensityStandard: 'Standard',
    toolbarDensityComfortable: 'Comoda',
    // Columns selector toolbar button text
    toolbarColumns: 'Columnas',
    toolbarColumnsLabel: 'Seleccionar columnas',
    // Filters toolbar button text
    toolbarFilters: 'Filtros',
    toolbarFiltersLabel: 'Mostrar filtros',
    toolbarFiltersTooltipHide: 'Ocultar filtros',
    toolbarFiltersTooltipShow: 'Mostrar filtros',
    toolbarFiltersTooltipActive: count => count > 1 ? `${count} filtros activos` : `${count} filtro activo`,
    // Quick filter toolbar field
    toolbarQuickFilterPlaceholder: 'Buscar...',
    toolbarQuickFilterLabel: 'Buscar',
    // toolbarQuickFilterDeleteIconLabel: 'Clear',
    // Export selector toolbar button text
    toolbarExport: 'Exportar',
    toolbarExportLabel: 'Exportar',
    toolbarExportCSV: 'Descargar como CSV',
    // toolbarExportPrint: 'Print',
    // toolbarExportExcel: 'Download as Excel',
    // Columns panel text
    columnsPanelTextFieldLabel: 'Columna de búsqueda',
    columnsPanelTextFieldPlaceholder: 'Título de columna',
    columnsPanelDragIconLabel: 'Reorder columna',
    columnsPanelShowAllButton: 'Mostrar todo',
    columnsPanelHideAllButton: 'Ocultar todo',
    // Filter panel text
    filterPanelAddFilter: 'Agregar filtro',
    filterPanelDeleteIconLabel: 'Borrar',
    // filterPanelLinkOperator: 'Logic operator',
    filterPanelOperators: 'Operadores',
    // TODO v6: rename to filterPanelOperator
    filterPanelOperatorAnd: 'Y',
    filterPanelOperatorOr: 'O',
    filterPanelColumns: 'Columnas',
    filterPanelInputLabel: 'Valor',
    filterPanelInputPlaceholder: 'Valor de filtro',
    // Filter operators text
    filterOperatorContains: 'contiene',
    filterOperatorEquals: 'es igual',
    filterOperatorStartsWith: 'comienza con',
    filterOperatorEndsWith: 'termina con',
    filterOperatorIs: 'es',
    filterOperatorNot: 'no es',
    filterOperatorAfter: 'es posterior',
    filterOperatorOnOrAfter: 'es en o posterior',
    filterOperatorBefore: 'es anterior',
    filterOperatorOnOrBefore: 'es en o anterior',
    filterOperatorIsEmpty: 'está vacío',
    filterOperatorIsNotEmpty: 'no esta vacío',
    filterOperatorIsAnyOf: 'es cualquiera de',
    // Filter values text
    filterValueAny: 'cualquiera',
    filterValueTrue: 'verdadero',
    filterValueFalse: 'falso',
    // Column menu text
    columnMenuLabel: 'Menú',
    columnMenuShowColumns: 'Mostrar columnas',
    columnMenuFilter: 'Filtro',
    columnMenuHideColumn: 'Ocultar',
    columnMenuUnsort: 'Desordenar',
    columnMenuSortAsc: 'Ordenar asc',
    columnMenuSortDesc: 'Ordenar desc',
    // Column header text
    columnHeaderFiltersTooltipActive: count => count > 1 ? `${count} filtros activos` : `${count} filtro activo`,
    columnHeaderFiltersLabel: 'Mostrar filtros',
    columnHeaderSortIconLabel: 'Ordenar',
    // Rows selected footer text
    //footerRowSelected: count => count > 1 ? `${count.toLocaleString()} filas seleccionadas` : `${count.toLocaleString()} fila seleccionada`,
    footerRowSelected: count => count > 1 ? '' : '',
    footerTotalRows: 'Filas Totales:',
    // Total visible row amount footer text
    footerTotalVisibleRows: (visibleCount, totalCount) => `${visibleCount.toLocaleString()} de ${totalCount.toLocaleString()}`,
    // Checkbox selection text
    // checkboxSelectionHeaderName: 'Checkbox selection',
    // checkboxSelectionSelectAllRows: 'Select all rows',
    // checkboxSelectionUnselectAllRows: 'Unselect all rows',
    // checkboxSelectionSelectRow: 'Select row',
    // checkboxSelectionUnselectRow: 'Unselect row',
    // Boolean cell text
    booleanCellTrueLabel: 'Si',
    booleanCellFalseLabel: 'No',
    // Actions cell more text
    actionsCellMore: 'más', // Column pinning text
    // pinToLeft: 'Pin to left',
    // pinToRight: 'Pin to right',
    // unpin: 'Unpin',
    // Tree Data
    // treeDataGroupingHeaderName: 'Group',
    // treeDataExpand: 'see children',
    // treeDataCollapse: 'hide children',
    // Grouping columns
    // groupingColumnHeaderName: 'Group',
    // groupColumn: name => `Group by ${name}`,
    // unGroupColumn: name => `Stop grouping by ${name}`,
    // Master/detail
    // detailPanelToggle: 'Detail panel toggle',
    // expandDetailPanel: 'Expand',
    // collapseDetailPanel: 'Collapse',
    // Row reordering text
    // rowReorderingHeaderName: 'Row reordering',

}


