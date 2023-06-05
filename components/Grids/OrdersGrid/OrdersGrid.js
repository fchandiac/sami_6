import React, { useState, useEffect } from 'react'
import AppDataGrid from '../../AppDataGrid'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import InfoIcon from '@mui/icons-material/Info'
import PrintIcon from '@mui/icons-material/Print'
import { GridActionsCellItem } from '@mui/x-data-grid'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, Autocomplete } from '@mui/material'
import moment from 'moment'
import OrdersDetailsGrid from '../OrdersDetailsGrid/OrdersDetailsGrid'

const orders = require('../../../promises/orders')
const utils = require('../../../utils')

export default function OrdersGrid() {
    const [gridApiRef, setGridApiRef] = useState(null)
    const [rowData, setRowData] = useState(rowDataDefault())
    const [ordersList, setOrdersList] = useState([])
    const [openinfoDialog, setOpeninfoDialog] = useState(false)


    useEffect(() => {
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
    }, [])


    const columns = [
        { field: 'id', headerName: 'Id', flex: .2, type: 'number' },
        { field: 'amount', headerName: 'Monto', flex: .25, type: 'number', valueFormatter: (params) => utils.renderMoneystr(params.value) },
        { field: 'date', headerName: 'Fecha - hora', flex: .3, type: 'date', valueFormatter: (params) => moment(params.value).format('DD-MM-YYYY HH:mm:ss') },
        { field: 'stateString', headerName: 'Estado', flex: .2 },
        {
            field: 'state', headerName: 'Estado', flex: .14,
            renderCell: (params) => {
                return params.row.state === 'Carrado' ? <CheckCircleIcon sx={{ color: 'green' }} /> : <CancelIcon sx={{ color: 'red' }} />
            }

        },
        {
            field: 'actions',
            headerName: '',
            headerClassName: 'data-grid-last-column-header',
            type: 'actions', flex: .25, getActions: (params) => [
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
                        // setRowData({
                        //     rowId: params.id,
                        //     id: params.row.id,
                        //     name: params.row.name,
                        // })
                        // setOpenDestroyDialog(true)
                    }}
                />,
                <GridActionsCellItem
                    label='Update'
                    icon={<CheckCircleIcon sx={{ color: 'green' }} />}
                    onClick={() => {
                        // setRowData({
                        //     rowId: params.id,
                        //     id: params.row.id,
                        //     name: params.row.name,
                        // })
                        // setOpenDestroyDialog(true)
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
                        <Grid item sx={6} sm={6} md={6} lg={6}>
                            <TextField
                                label="Id"
                                value={rowData.id}
                                inputProps={{ readOnly: true }}
                                variant="outlined"
                                size={'small'}
                                fullWidth
                            />
                        </Grid>
                        <Grid item sx={6} sm={6} md={6} lg={6}>
                            <TextField
                                label="Monto"
                                value={utils.renderMoneystr(rowData.amount)}
                                inputProps={{ readOnly: true }}
                                variant="outlined"
                                size={'small'}
                                fullWidth
                            />
                        </Grid>
                        <Grid item sx={6} sm={6} md={6} lg={6}>
                            <TextField
                                label="Fecha - hora"
                                value={moment(rowData.date).format('DD-MM-YYYY HH:mm:ss')}
                                inputProps={{ readOnly: true }}
                                variant="outlined"
                                size={'small'}
                                fullWidth
                            />
                        </Grid>
                        <Grid item sx={6} sm={6} md={6} lg={6}>
                            <TextField
                                label="Estado"
                                value={rowData.stateString}
                                inputProps={{ readOnly: true }}
                                variant="outlined"
                                size={'small'}
                                fullWidth
                            />
                        </Grid>
                        <Grid item sx={12} sm={12} md={12} lg={12}>
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
        amount:0,
        state: 0,
        stateString: '',
        ordersdetails: [],
        date: new Date()
    }
}