import React, { useState, useEffect } from 'react'
import AppDataGrid from '../../AppDataGrid'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import InfoIcon from '@mui/icons-material/Info'
import DeleteIcon from '@mui/icons-material/Delete'
import PrintIcon from '@mui/icons-material/Print'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import { GridActionsCellItem } from '@mui/x-data-grid'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, Autocomplete } from '@mui/material'
import moment from 'moment'
import OrdersDetailsGrid from '../OrdersDetailsGrid/OrdersDetailsGrid'
import electron from 'electron'
const ipcRenderer = electron.ipcRenderer || false
import { useAppContext } from '../../../AppProvider'

const orders = require('../../../promises/orders')
const utils = require('../../../utils')
const products = require('../../../promises/products')

export default function OrdersGrid(props) {
    const { update } = props
    const { dispatch, ordersInCart } = useAppContext()
    const [gridApiRef, setGridApiRef] = useState(null)
    const [rowData, setRowData] = useState(rowDataDefault())
    const [ordersList, setOrdersList] = useState([])
    const [openinfoDialog, setOpeninfoDialog] = useState(false)
    const [printer, setPrinter] = useState({ idVendor: 0, idProduct: 0 })


    useEffect(() => {
        let printer = ipcRenderer.sendSync('get-printer', 'sync')
        setPrinter(printer)
        orders.findAll().then(res => {
            console.log(res)
            let data = res.map(item => ({
                id: item.id,
                amount: item.ordersdetails.reduce((acc, item) => acc + item.subtotal, 0),
                stateString: item.state ? 'Cerrado' : 'Pendiente',
                state: item.state ? 'Cerrado' : 'Pendiente',
                ordersdetails: item.ordersdetails,
                date: item.createdAt

            }))
            setOrdersList(data)
        })
            .catch(err => console.log(err))
    }, [update])

    const updateState = (id) => {
        orders.updateState(id, true)
            .then(() => {
                gridApiRef.current.updateRows([{ id: id, state: 'Cerrado', stateString: 'Cerrado' }])
            })
            .catch(err => console.log(err))
    }

    const print = async (id, total, date, cart) => {
        let printinfo = {
            printer: printer,
            order_id: id,
            total: total,
            date: moment(date).format('DD-MM-yyyy'),
            time: moment(date).format('HH:mm'),
            cart: cart
        }
        console.log(printinfo)
        const findPrinter = await ipcRenderer.invoke('find-printer', printer)
        if (!findPrinter) {
            dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'Error de conexión con la impresora' } })
        } else {
            ipcRenderer.send('complete-order', printinfo)
        }
    }

    const destroy = (id) => {
        orders.destroy(id)
            .then(() => {
                gridApiRef.current.updateRows([{ id: id, _action: 'delete' }])
            })
            .catch(err => console.log(err))
    }

    const addOrderToCart = async (cart, order_id) => {
        let findOrder = ordersInCart.find(item => item.order_id == order_id)
        if (!findOrder) {
            let newCart = []
            cart.map(item => {
                products.findOneById(item.product_id)
                    .then(product => {
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



                    })
            })

            dispatch({ type: 'SET_CASH_REGISTER_TAB', value: 0 })
            setTimeout(() => {
                newCart.map(item => {
                    setTimeout(() => {
                        if (item.specialProduct == true) {
                            dispatch({ type: 'ADD_SPECIAL_TO_CART', value: item })
                        } else {
                            dispatch({ type: 'ADD_TO_CART', value: item })
                        }
                    }, 1000)
                })
                ordersInCart.push({ order_id: order_id })
                dispatch({ type: 'SET_ORDERS_IN_CART', value: ordersInCart })

            }, 1000)

        } else {
            dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'La orden ya se encuentra en la lista' } })
        }

    }


    const columns = [
        { field: 'id', headerName: 'Id', flex: .15, type: 'number' },
        { field: 'amount', headerName: 'Monto', flex: .2, type: 'number', valueFormatter: (params) => utils.renderMoneystr(params.value) },
        { field: 'date', headerName: 'Fecha - hora', flex: .3, type: 'date', valueFormatter: (params) => moment(params.value).format('DD-MM-YYYY HH:mm:ss') },
        { field: 'stateString', headerName: 'Estado', flex: .2 },
        {
            field: 'state', headerName: 'Estado', flex: .14,
            renderCell: (params) => {
                return params.row.state === 'Cerrado' ? <CheckCircleIcon sx={{ color: 'green' }} /> : <CancelIcon sx={{ color: 'red' }} />
            }

        },
        {
            field: 'actions',
            headerName: '',
            headerClassName: 'data-grid-last-column-header',
            type: 'actions', flex: .3, getActions: (params) => [
                <GridActionsCellItem
                    label='Info'
                    icon={<InfoIcon />}
                    onClick={() => {
                        setRowData({
                            rowId: params.id,
                            id: params.row.id,
                            amount: params.row.amount,
                            state: params.row.state,
                            stateString: params.row.stateString,
                            ordersdetails: params.row.ordersdetails,
                            date: params.row.date
                        })
                        setOpeninfoDialog(true)
                    }}
                />,
                <GridActionsCellItem
                    label='Print'
                    icon={<PrintIcon />}
                    onClick={() => {
                        print(params.row.id, params.row.amount, params.row.date, params.row.ordersdetails)

                    }}
                />,
                <GridActionsCellItem
                    sx={{ display: params.row.state == 'Pendiente' ? 'inline-flex' : 'none' }}
                    label='Add to Cart'
                    icon={<ShoppingCartIcon />}
                    onClick={() => {
                        addOrderToCart(params.row.ordersdetails, params.row.id)
                    }}
                />,
                <GridActionsCellItem
                    sx={{ display: params.row.state == 'Pendiente' ? 'inline-flex' : 'none' }}
                    label='Update'
                    icon={<CheckCircleIcon sx={{ color: 'green' }} />}
                    onClick={() => {

                        updateState(params.row.id)
                        // setOpenDestroyDialog(true)
                    }}
                />,
                <GridActionsCellItem
                    label='Delete'
                    icon={<DeleteIcon />}
                    onClick={() => {
                        destroy(params.row.id)
                    }}
                />

            ]
        }
    ]

    return (
        <>
            <AppDataGrid title='Pedidos' rows={ordersList} columns={columns} height='80vh' setGridApiRef={setGridApiRef} />
            <Dialog open={openinfoDialog} maxWidth={'md'} fullWidth>
                <DialogTitle sx={{ p: 2 }}>
                    Detalle del pedido
                </DialogTitle>
                <DialogContent sx={{ p: 2 }}>
                    <Grid container spacing={1} pt={1}>
                        <Grid item xs={6} sm={6} md={6} lg={6}>
                            <TextField
                                label="Id"
                                value={rowData.id}
                                inputProps={{ readOnly: true }}
                                variant="outlined"
                                size={'small'}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6} sm={6} md={6} lg={6}>
                            <TextField
                                label="Monto"
                                value={utils.renderMoneystr(rowData.amount)}
                                inputProps={{ readOnly: true }}
                                variant="outlined"
                                size={'small'}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6} sm={6} md={6} lg={6}>
                            <TextField
                                label="Fecha - hora"
                                value={moment(rowData.date).format('DD-MM-YYYY HH:mm:ss')}
                                inputProps={{ readOnly: true }}
                                variant="outlined"
                                size={'small'}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6} sm={6} md={6} lg={6}>
                            <TextField
                                label="Estado"
                                value={rowData.stateString}
                                inputProps={{ readOnly: true }}
                                variant="outlined"
                                size={'small'}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={12} lg={12}>
                            <OrdersDetailsGrid detailsList={rowData.ordersdetails} />
                        </Grid>

                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button variant={'outlined'} onClick={() => setOpeninfoDialog(false)}>Cerrar</Button>
                </DialogActions>

            </Dialog>
        </>
    )
}

function rowDataDefault() {
    return {
        rowId: 0,
        id: 0,
        amount: 0,
        state: 0,
        stateString: '',
        ordersdetails: [],
        date: new Date()
    }
}