import React, { useState, useEffect } from 'react'
import { GridActionsCellItem } from '@mui/x-data-grid'
import DeleteIcon from '@mui/icons-material/Delete'
import InfoIcon from '@mui/icons-material/Info'
import PaidIcon from '@mui/icons-material/Paid'
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, Autocomplete,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material'
import moment from 'moment'
import AppInfoDataGrid from '../../AppInfoDataGrid'
import DetailsGrid from '../DetailsGrid/DetailsGrid'
import AppPaper from '../../AppPaper/AppPaper'
import { useAppContext } from '../../../AppProvider'
import InfoGrid from './InfoGrid'

const pays = require('../../../promises/pays')
const utils = require('../../../utils')
const customers = require('../../../promises/customers')
const sales = require('../../../promises/sales')
const partialPayments = require('../../../promises/partialPatyments')


export default function PaysGrid(props) {
    const { title, paysList, hideCustomer, heightGrid, customerId } = props
    const { user, dispatch } = useAppContext()
    const [gridApiRef, setGridApiRef] = useState(null)
    const [rowData, setRowData] = useState(rowDataDefault())
    const [openDestroyDialog, setOpenDestroyDialog] = useState(false)
    const [openPartialPaymentsDialog, setOpenPartialPaymentsDialog] = useState(false)
    const [openInfoDialog, setOpenInfoDialog] = useState(false)
    const [saleData, setSaleData] = useState(saleDataDefault())
    const [partialPayment, setPartialPayment] = useState(partialPaymentDefault())
    const [partialPaymentsList, setPartialPaymentsList] = useState([])
    const [updateGrid, setUpdateGrid] = useState(false)
    const [payData, setPayData] = useState([])

    useEffect(() => {
        customers.findOneById(customerId)
            .then((res) => {
                console.log(res)
                setPayData(res.Pays)
            })
            .catch((err) => { console.error(err) })
    }, [updateGrid, customerId])

    const updatePaysGrid = () => {
        setUpdateGrid(!updateGrid)
    }

    useEffect(() => {
        updatePaysGrid()
    }, [openPartialPaymentsDialog])


    const destroy = () => {
        categories.destroy(rowData.id)
            .then(() => {
                gridApiRef.current.updateRows([{ id: rowData.rowId, _action: 'delete' }])
                setOpenDestroyDialog(false)
            })
            .catch(err => { console.error(err) })
    }

    const findPartialPayments = async (id) => {
        const list = await partialPayments.findAllByPay(id)
        console.log('PARTIAL PAYMENTS', list)
        setPartialPaymentsList(list)
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
            user: 'user'
        })
        setOpenInfoDialog(true)
    }

    const newPartialPayment = () => {
        if (partialPayment.amount > rowData.balance) {
            dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'El monto no puede ser superior al saldo' } })
        } else {


            let detail = [{
                pay_id: rowData.id,
                amount: partialPayment.amount,
            }]
            partialPayments.create(
                partialPayment.amount,
                detail,
                (user.id == 0) ? 1001 : user.id,
                partialPayment.customer_id
            )
                .then((res) => {
                    pays.addPaid(rowData.id, partialPayment.amount)
                        .then(res => {
                            console.log(res)
                            gridApiRef.current.updateRows([{
                                id: rowData.id,
                                state: res.state ? 'Pagado' : 'Pendiente',
                                paid: res.paid,
                                balance: res.balance
                            }])
                            setOpenPartialPaymentsDialog(false)
                            setPartialPaymentsList([])
                        })
                        .catch(err => { console.error(err) })
                })
                .catch(err => { console.error(err) })
        }
    }

    const columns = [
        { field: 'id', headerName: 'Id', flex: .4, type: 'number', hide: false },
        { field: 'sale_id', headerName: 'Venta', flex: .3 },
        { field: 'customer_name', headerName: 'Cliente', flex: .9, hide: hideCustomer },
        { field: 'amount', headerName: 'Monto', flex: .45, type: 'number', valueFormatter: (params) => utils.renderMoneystr(params.value) },
        { field: 'payment_method', headerName: 'Medio', flex: .5 },
        {
            field: 'state', headerName: 'Estado', flex: .35,
            renderCell: (params) => {
                return params.row.state === true ? <PaidIcon sx={{ color: 'green' }} /> : <PaidIcon sx={{ color: 'red' }} />
            }
        },
        { field: 'paid', headerName: 'Pagado', flex: .4, type: 'number', valueFormatter: (params) => utils.renderMoneystr(params.value) },
        { field: 'balance', headerName: 'Saldo', flex: .4, type: 'number', valueFormatter: (params) => utils.renderMoneystr(params.value) },
        { field: 'createdAt', headerName: 'Fecha venta', flex: .6, type: 'date', valueFormatter: (params) => moment(params.value).format('DD-MM-YYYY HH:mm') },
        { field: 'date', headerName: 'Fecha pago', flex: .6, type: 'date', valueFormatter: (params) => moment(params.value).format('DD-MM-YYYY') },
        {
            field: 'actions',
            headerName: '',
            headerClassName: 'data-grid-last-column-header',
            type: 'actions', flex: .4, getActions: (params) => [
                <GridActionsCellItem
                    // sx={{ display: params.row.state === 'Pagado' ? 'none' : 'block' }}
                    label='update State'
                    icon={<PaidIcon />}
                    onClick={() => {
                        setRowData(
                            {
                                id: params.row.id,
                                rowId: params.id,
                                state: params.row.state,
                                amount: params.row.amount,
                                balance: params.row.balance,
                                paid: params.row.paid,
                                sale_id: params.row.sale_id,
                                createdAt: params.row.createdAt,
                                date: params.row.date,
                                customer_name: params.row.customer_name,
                            }
                        )
                        findPartialPayments(params.row.id)
                        setPartialPayment({
                            ...partialPayment,
                            customer_id: params.row.customer_id,
                            user_id: user.id,
                            amount: params.row.balance,
                        })
                        setOpenPartialPaymentsDialog(true)
                    }}
                />,
                <GridActionsCellItem
                    label='Info'
                    icon={<InfoIcon />}
                    onClick={() => {
                        setRowData(
                            {
                                id: params.row.id,
                                rowId: params.id,
                                state: params.row.state,
                                amount: params.row.amount,
                                balance: params.row.balance,
                                paid: params.row.paid,
                                sale_id: params.row.sale_id,
                                createdAt: params.row.createdAt,
                                date: params.row.date,
                                customer_name: params.row.customer_name,
                            }
                        )
                        info(params.row.sale_id)

                    }}
                />
            ]
        }
    ]

    return (
        <>
            {/* <AppInfoDataGrid
                title={title}
                rows={paysList}
                columns={columns}
                height= {heightGrid} 
                setGridApiRef={setGridApiRef}
                infoField={'amount'}
                infoTitle={'Total pagos: '}
                money={true}
            /> */}

            <InfoGrid
                title={title}
                rows={payData}
                columns={columns}
                height={heightGrid}
                setGridApiRef={setGridApiRef}
                infoField={'amount'}
                infoTitle={'Total pagos: '}
                money={true}
                updatePaysGrid={updatePaysGrid}

            />



            <Dialog open={openInfoDialog} maxWidth={'md'} fullWidth>
                <DialogTitle sx={{ p: 2 }}>
                    Información venta asociada
                </DialogTitle>
                <DialogContent sx={{ p: 2 }}>
                    <Grid container spacing={1} pt={1}>
                        <Grid item xs={6} md={6} sm={6} lg={6}>
                            <TextField
                                label="Venta"
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
                                value={saleData.dte_number === 0 ? 'Sin DTE' : saleData.dte_number}
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
                        <Grid item xs={6} md={6} sm={6} lg={6}>
                            <TextField
                                label="Vendedor"
                                value={saleData.user}
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

            <Dialog open={openPartialPaymentsDialog} maxWidth={'md'} fullWidth>
                <DialogTitle sx={{ p: 2 }}>
                    Abonos al pago {rowData.id} del cliente {rowData.customer_name}
                </DialogTitle>
                <DialogContent sx={{ p: 2 }}>
                    <Grid container spacing={1}>
                        <Grid item xs={4} md={4} sm={4} lg={4} >
                            <Grid container spacing={1} direction={'column'}>
                                <Grid item>
                                    <form onSubmit={(e) => { e.preventDefault(); newPartialPayment() }}>
                                        <AppPaper title={'Nuevo abono'}>
                                            <Grid container spacing={1} p={1} direction={'column'}>
                                                <Grid item>
                                                    <TextField
                                                        label="Monto"
                                                        value={utils.renderMoneystr(partialPayment.amount)}
                                                        size='small'
                                                        required
                                                        fullWidth
                                                        variant='outlined'
                                                        autoFocus
                                                        onChange={(e) => { e.target.value === '$ ' || e.target.value === '$' || e.target.value === '0' || e.target.value === '' ? setPartialPayment({ ...partialPayment, amount: 0 }) : setPartialPayment({ ...partialPayment, amount: utils.moneyToInt(e.target.value) }) }}
                                                    />
                                                </Grid>
                                                <Grid item textAlign={'right'}>
                                                    <Button
                                                        variant='contained'
                                                        type='submit'
                                                        disabled={partialPayment.amount === 0}
                                                    >Abonar</Button>
                                                </Grid>
                                            </Grid>
                                        </AppPaper>
                                    </form>
                                </Grid>

                                <Grid item>
                                    <AppPaper title={'Información del pago'}>
                                        <Grid container spacing={1} p={1} direction={'column'}>
                                            <Grid item>
                                                <TextField
                                                    label='Estado'
                                                    value={rowData.state}
                                                    size='small'
                                                    inputProps={{
                                                        readOnly: true,
                                                        style: { color: rowData.state === 'Pagado' ? 'green' : 'red' }
                                                    }}
                                                    fullWidth
                                                    variant='outlined'
                                                />
                                            </Grid>
                                            <Grid item>
                                                <TextField
                                                    label='Monto'
                                                    value={utils.renderMoneystr(rowData.amount)}
                                                    size='small'
                                                    inputProps={{ readOnly: true }}
                                                    fullWidth
                                                    variant='outlined'
                                                />
                                            </Grid>
                                            <Grid item>
                                                <TextField
                                                    label='Abonado'
                                                    value={utils.renderMoneystr(partialPaymentsList.reduce((accumulator, element) => accumulator + element.amount_detail, 0))}
                                                    size='small'
                                                    inputProps={{ readOnly: true }}
                                                    fullWidth
                                                    variant='outlined'
                                                />
                                            </Grid>
                                            <Grid item>
                                                <TextField
                                                    label='Saldo'
                                                    value={utils.renderMoneystr(rowData.balance)}
                                                    size='small'
                                                    inputProps={{ readOnly: true }}
                                                    fullWidth
                                                    variant='outlined'
                                                />
                                            </Grid>
                                            <Grid item>
                                                <TextField
                                                    label='Cliente'
                                                    value={rowData.customer_name}
                                                    size='small'
                                                    inputProps={{ readOnly: true }}
                                                    fullWidth
                                                    variant='outlined'
                                                />
                                            </Grid>
                                        </Grid>
                                    </AppPaper>
                                </Grid>
                            </Grid>

                        </Grid>
                        <Grid item xs={8} md={8} sm={8} lg={8}>
                            <AppPaper title={'Abonos'}>
                                <Table sx={{ minWidth: 300 }} aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Id</TableCell>
                                            <TableCell>Monto</TableCell>
                                            <TableCell>Fecha</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {partialPaymentsList.map((row) => (
                                            <TableRow
                                                key={row.id}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell >
                                                    {row.id}
                                                </TableCell>
                                                <TableCell >{utils.renderMoneystr(row.amount_detail)}</TableCell>
                                                <TableCell>{moment(row.created_at).format('DD-MM-YYYY HH:mm')}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </AppPaper>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button variant={'outlined'} onClick={() => setOpenPartialPaymentsDialog(false)}>Cerrar</Button>
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
        user: '',
        date: moment().format('YYYY-MM-DD'),
    }
}

function rowDataDefault() {
    return {
        id: 0,
        rowId: 0,
        sale_id: 0,
        customer_name: '',
        amount: 0,
        payment_method: '',
        state: '',
        paid: 0,
        balance: 0,
        createdAt: moment().format('YYYY-MM-DD'),
        date: moment().format('YYYY-MM-DD'),
    }
}

function partialPaymentDefault() {
    return {
        customer_id: 0,
        user_id: 0,
        amount: 0,
        detail: []
    }
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