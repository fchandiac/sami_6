import React, { useState, useEffect } from 'react'
import { GridActionsCellItem } from '@mui/x-data-grid'
import DeleteIcon from '@mui/icons-material/Delete'
import InfoIcon from '@mui/icons-material/Info'
import PaidIcon from '@mui/icons-material/Paid'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, Autocomplete } from '@mui/material'
import moment from 'moment'
import AppInfoDataGrid from '../../AppInfoDataGrid'
import DetailsGrid from '../DetailsGrid/DetailsGrid'

const pays = require('../../../promises/pays')
const utils = require('../../../utils')
const customers = require('../../../promises/customers')
const sales = require('../../../promises/sales')

export default function PaysGrid(props) {
    const { filterDates } = props
    const [gridApiRef, setGridApiRef] = useState(null)
    const [rowData, setRowData] = useState([])
    const [paysList, setPaysList] = useState([])
    const [openDestroyDialog, setOpenDestroyDialog] = useState(false)
    const [openInfoDialog, setOpenInfoDialog] = useState(false)
    const [saleData, setSaleData] = useState(saleDataDefault())
    const [title, setTitle] = useState('Pagos')

    useEffect(() => {
        if (moment(filterDates.start).format('DD-MM-YYYY') == moment(filterDates.end).format('DD-MM-YYYY')){
            setTitle('Pagos del ' + moment(filterDates.start).format('DD-MM-YYYY'))
        } else {
            setTitle('Pagos del ' + moment(filterDates.start).format('DD-MM-YYYY') + ' al ' + moment(filterDates.end).format('DD-MM-YYYY'))
        }

    }, [filterDates])



    useEffect(() => {
        pays.findAllBetweenDates(filterDates.start, filterDates.end)
            .then((res) => {
                let data = res.map((item) => ({
                    id: item.id,
                    sale_id: item.sale_id,
                    customer_id: item.customer_id == null ? 0 : item.customer_id,
                    customer_name: item.customer_id == null ? 'Sin cliente' : '',
                    amount: item.amount,
                    payment_method: item.payment_method,
                    state: item.state == true ? 'Pagado' : 'Pendiente',
                    date: item.date
                }))
                data.map((item) => {
                    if (item.customer_id !== 0) {
                        customers.findOneById(item.customer_id)
                            .then((res) => {
                                item.customer_name = res.name
                            })
                            .catch(err => { console.error(err) })
                    }
                })
                setPaysList(data)
            })
            .catch(err => { console.error(err) })
    }, [filterDates])

    const destroy = () => {
        categories.destroy(rowData.id)
            .then(() => {
                gridApiRef.current.updateRows([{ id: rowData.rowId, _action: 'delete' }])
                setOpenDestroyDialog(false)
            })
            .catch(err => { console.error(err) })
    }

    const updateState = (id) => {
        pays.updateState(id, true)
            .then(() => {
                gridApiRef.current.updateRows([{ id: id, state: 'Pagado' }])
            })
            .catch(err => { console.error(err) })
    }

    const info = async (sale_id) => {
        const sale = await sales.findOneById(sale_id)
        console.log(sale)
        setSaleData({
            id: sale.id,
            amount: sale.amount,
            dte_code: sale.dte_code,
            dte_number: sale.dte_number,
            date: sale.createdAt,
            payment_method: sale.payment_method,
        })
        setOpenInfoDialog(true)

    }

    const columns = [
        { field: 'id', headerName: 'Id', flex: .3, type: 'number' },
        { field: 'sale_id', headerName: 'Venta', flex: .3 },
        { field: 'customer_name', headerName: 'Cliente', flex: 1 },
        { field: 'amount', headerName: 'Monto', flex: .5, type: 'number', valueFormatter: (params) => utils.renderMoneystr(params.value) },
        { field: 'payment_method', headerName: 'Medio de pago', flex: .7 },
        {
            field: 'state', headerName: 'Estado', flex: .4,
            renderCell: (params) => {
                return params.row.state === 'Pagado' ? <PaidIcon sx={{ color: 'green' }} /> : <PaidIcon sx={{ color: 'red' }} />
            }
        },
        { field: 'date', headerName: 'Fecha', flex: .8, type: 'date', valueFormatter: (params) => moment(params.value).format('DD-MM-YYYY HH:mm') },
        {
            field: 'actions',
            headerName: '',
            headerClassName: 'data-grid-last-column-header',
            type: 'actions', flex: .4, getActions: (params) => [
                <GridActionsCellItem
                    sx={{ display: params.row.state === 'Pagado' ? 'none' : 'block' }}
                    label='update State'
                    icon={<PaidIcon sx={{ color: 'green' }} />}
                    onClick={() => {
                        updateState(params.row.id)
                    }}
                />,
                <GridActionsCellItem
                    label='Info'
                    icon={<InfoIcon />}
                    onClick={() => {
                        info(params.row.sale_id)

                    }}
                />
            ]
        }
    ]

    return (
        <>
            <AppInfoDataGrid
                title={title}
                rows={paysList}
                columns={columns}
                height='80vh'
                setGridApiRef={setGridApiRef}
                infoField={'amount'}
                infoTitle={'Total pagos: '}
                money={true}
            />

            <Dialog open={openInfoDialog} maxWidth={'md'} fullWidth>
                <DialogTitle sx={{ p: 2 }}>
                    Información venta asociada
                </DialogTitle>
                    <DialogContent sx={{ p: 2 }}>
                        <Grid container spacing={1} pt={1}>
                            <Grid item xs={6} md={6} sm={6} lg={6}>
                                <TextField
                                    label="Id"
                                    value={saleData.id}
                                    inputProps={{ readOnly: true }}
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={6} md={6} sm={6} lg={6}>
                                <TextField
                                    label="Monto"
                                    value={utils.renderMoneystr(saleData.amount)}
                                    inputProps={{ readOnly: true }}
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={6} md={6} sm={6} lg={6}>
                                <TextField
                                    label="DTE"
                                    value={dteString(saleData.dte_code)}
                                    inputProps={{ readOnly: true }}
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={6} md={6} sm={6} lg={6}>
                                <TextField
                                    label="Folio"
                                    value={saleData.dte_number === 0? 'Sin DTE': saleData.dte_number} 
                                    inputProps={{ readOnly: true }}
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={6} md={6} sm={6} lg={6}>
                                <TextField
                                    label="Medio de pago"
                                    value={saleData.payment_method}
                                    inputProps={{ readOnly: true }}
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={6} md={6} sm={6} lg={6}>
                                <TextField
                                    label="Fecha"
                                    value={moment(saleData.date).format('DD-MM-YYYY HH:mm')}
                                    inputProps={{ readOnly: true }}
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} md={12} sm={12} lg={12}>
                                <DetailsGrid sale_id={saleData.id} />
                            </Grid>

                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button variant={'outlined'} onClick={() => setOpenInfoDialog(false)}>Cerrar</Button>
                    </DialogActions>
            </Dialog>

        </>
    )
}

function saleDataDefault() {
    return {
        id: 0,
        amount: 0,
        dte_code: 0,
        dte_number: 0,
        payment_method: '',
        date: moment().format('YYYY-MM-DD'),
    }
}

function dteString(value){
    if(value === 33){
        return 'Factura'
    } else if (value === 39){
        return 'Boleta'
    } else {
        return 'Sin DTE'
    }
}