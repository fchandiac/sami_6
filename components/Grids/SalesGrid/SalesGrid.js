import React, { useState, useEffect } from 'react'
import AppDataGrid from '../../AppDataGrid'
import { GridActionsCellItem } from '@mui/x-data-grid'
import DeleteIcon from '@mui/icons-material/Delete'
import InfoIcon from '@mui/icons-material/Info'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, Autocomplete } from '@mui/material'

import AppInfoDataGrid from '../../AppInfoDataGrid'
import moment from 'moment'
import DetailsGrid from '../DetailsGrid/DetailsGrid'

const sales = require('../../../promises/sales')
const utils = require('../../../utils')

export default function SalesGrid(props) {
    const { filterDates } = props
    const [gridApiRef, setGridApiRef] = useState(null)
    const [rowData, setRowData] = useState(rowDataDefault())
    const [salesList, setSalesList] = useState([])
    const [openDestroyDialog, setOpenDestroyDialog] = useState(false)
    const [openDetailDialog, setOpenDetailDialog] = useState(false)
    const [title, setTitle] = useState('Ventas')


    useEffect(() => {
        if (moment(filterDates.start).format('DD-MM-YYYY') == moment(filterDates.end).format('DD-MM-YYYY')) {
            setTitle('Ventas del ' + moment(filterDates.start).format('DD-MM-YYYY'))
        } else {
            setTitle('Ventas del ' + moment(filterDates.start).format('DD-MM-YYYY') + ' al ' + moment(filterDates.end).format('DD-MM-YYYY'))
        }

    }, [filterDates])


    useEffect(() => {
        sales.findAllBetweenDates(filterDates.start, filterDates.end)
            .then((res) => {
                console.log(res)
                let data = res.map((item) => ({
                    id: item.id,
                    amount: item.amount,
                    date: item.createdAt,
                    dte_code: dteString(item.dte_code),
                    dte_number: item.dte_number,
                    payment_method: item.payment_method,
                    stock_control: item.stock_control,
                    user: item.User.name

                }))
                setSalesList(data)
            })
            .catch(err => { console.error(err) })

    }, [filterDates])

    const destroy = () => {
        sales.destroy(rowData.id)
            .then(() => {
                gridApiRef.current.updateRows([{ id: rowData.rowId, _action: 'delete' }])
                setOpenDestroyDialog(false)
            })
            .catch(err => { console.error(err) })
    }

    const columns = [
        { field: 'id', headerName: 'Id', flex: .5, type: 'number' },
        { field: 'user', headerName: 'Vendedor', flex: 1 },
        { field: 'amount', headerName: 'Monto', flex: 1, type: 'number', valueFormatter: (params) => utils.renderMoneystr(params.value) },
        { field: 'payment_method', headerName: 'Medio de pago', flex: 1 },
        { field: 'dte_code', headerName: 'DTE', flex: .6 },
        { field: 'dte_number', headerName: 'N° DTE', flex: .7 },
        { field: 'date', headerName: 'Fecha - hora', flex: 1, type: 'dateTime', valueFormatter: (params) => moment(params.value).format('DD-MM-YYYY HH:mm') },
        {
            field: 'actions',
            headerName: '',
            headerClassName: 'data-grid-last-column-header',
            type: 'actions', flex: .5, getActions: (params) => [
                <GridActionsCellItem
                    label='delete'
                    icon={<DeleteIcon />}
                    onClick={() => {
                        setRowData({
                            rowId: params.id,
                            id: params.row.id,
                            amount: params.row.amount,
                        })
                        setOpenDestroyDialog(true)
                    }}
                />,
                <GridActionsCellItem
                    label='info'
                    icon={<InfoIcon />}
                    onClick={() => {
                        setRowData({
                            rowId: params.id,
                            id: params.row.id,
                            amount: params.row.amount,
                        })
                        setOpenDetailDialog(true)
                    }}
                />
            ]
        }
    ]

    return (
        <>

            <AppInfoDataGrid
                title={title}
                rows={salesList}
                columns={columns}
                height='80vh'
                setGridApiRef={setGridApiRef}
                infoField={'amount'}
                infoTitle={'Total ventas: '}
                money={true}
            />

            <Dialog open={openDestroyDialog} maxWidth={'xs'} fullWidth>
                <DialogTitle sx={{ p: 2 }}>
                    Eliminar venta
                </DialogTitle>
                <form onSubmit={(e) => { e.preventDefault(); destroy() }}>
                    <DialogContent sx={{ p: 2 }}>
                        <Grid container spacing={1} direction={'column'}>
                            <Grid item>
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
                                    label='Monto'
                                    value={utils.renderMoneystr(rowData.amount)}
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

            <Dialog open={openDetailDialog} maxWidth={'md'} fullWidth>
                <DialogTitle sx={{ p: 2 }}>
                    Detalle de venta
                </DialogTitle>
                <DialogContent sx={{ p: 2 }}>
                    <Grid container spacing={1} direction={'column'}>
                        <Grid item>
                           <DetailsGrid sale_id = {rowData.id}/>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button variant={'outlined'} onClick={() => setOpenDetailDialog(false)}>Cerrar</Button>
                </DialogActions>

            </Dialog>
        </>
    )
}

function dteString(value) {
    if (value === 33) {
        return 'Factura'
    } else if (value === 39) {
        return 'Boleta'
    } else {
        return 'Sin DTE'
    }
}

function rowDataDefault() {
    return {
        id: 0,
        amount: 0,
        date: '',
        dte_code: 0,
        dte_number: 0,
        payment_method: 0,
        stock_control: false
    }
}