import React, { useState, useEffect } from 'react'
import AppDataGrid from '../../AppDataGrid'
import { GridActionsCellItem } from '@mui/x-data-grid'
import DeleteIcon from '@mui/icons-material/Delete'
import InfoIcon from '@mui/icons-material/Info'
import PaidIcon from '@mui/icons-material/Paid'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, Autocomplete } from '@mui/material'
import PaysGrid from '../PaysGrid/PaysGrid'

const customers = require('../../../promises/customers')
const pays = require('../../../promises/pays')

export default function AccountsGrid(props) {
    const { update } = props
    const [gridApiRef, setGridApiRef] = useState(null)
    const [rowData, setRowData] = useState([])
    const [customersList, setCustomersList] = useState([])
    const [openDestroyDialog, setOpenDestroyDialog] = useState(false)
    const [openInfoDialog, setOpenInfoDialog] = useState(false)
    const [openPaysDialog, setOpenPaysDialog] = useState(false)
    const [customerPaysList, setCustomerPaysList] = useState([])


    useEffect(() => {
        customers.findAll()
            .then((res) => {

                // console.log(res)
                const filteredData = res.filter(item => {
                    return item.Pays.some(pay => pay.state === false);
                  })

                let data = filteredData.map(item => ({
                    id: item.id,
                    name: item.name,
                    activity: item.activity,
                    rut: item.rut,
                }))

                setCustomersList(data)
            })
            .catch((err) => { })
    }, [update])

    useEffect(() => {
        pays.findAllByCustomerId(rowData.id)
            .then((res) => {
                let data = res.map((item) => ({
                    id: item.id,
                    sale_id: item.sale_id,
                    customer_id: item.customer_id == null ? 0 : item.customer_id,
                    customer_name: rowData.name,
                    amount: item.amount,
                    payment_method: item.payment_method,
                    state: item.state == true ? 'Pagado' : 'Pendiente',
                    paid: item.paid,
                    balance: item.balance,
                    date: item.date,
                    createdAt: item.createdAt,
                }))
                setCustomerPaysList(data)
            })
            .catch((err) => { console.error(err) })
    }, [rowData.id])

    const destroy = () => {
        customers.destroy(rowData.id)
            .then(() => {
                gridApiRef.current.updateRows([{ id: rowData.rowId, _action: 'delete' }])
                setOpenDestroyDialog(false)
            })
            .catch(err => { console.error(err) })
    }



    const columns = [
        { field: 'id', headerName: 'Id', flex: .3, type: 'number' },
        { field: 'rut', headerName: 'Rut', flex: .8},
        { field: 'name', headerName: 'Name', flex: 1.5 },
        { field: 'activity', headerName: 'Actividad', flex: 1 },
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
                            name: params.row.name,
                        })
                        setOpenDestroyDialog(true)
                    }}
                />,
                <GridActionsCellItem
                    label='pays'
                    icon={<PaidIcon />}
                    onClick={() => {
                        setRowData({
                            rowId: params.id,
                            id: params.row.id,
                            name: params.row.name,
                        })
                        setOpenPaysDialog(true)
                    }}
                />
            ]
        }
    ]

    return (
        <>
        
            <AppDataGrid title='' rows={customersList} columns={columns} height='80vh' setGridApiRef={setGridApiRef} />

            <Dialog open={openDestroyDialog} maxWidth={'xs'} fullWidth>
                <DialogTitle sx={{ p: 2 }}>
                    Eliminar cliente
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

            <Dialog open={openInfoDialog} maxWidth={'md'} fullWidth>
                <DialogTitle sx={{ p: 2 }}>
                    Información Cliente
                </DialogTitle>
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
                    <Button variant={'outlined'} onClick={() => setOpenInfoDialog(false)}>Cerrar</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openPaysDialog} maxWidth={'md'} fullWidth>
                <DialogTitle sx={{ p: 2 }}>
                    Pagos del cliente: {rowData.name}
                </DialogTitle>
                <DialogContent sx={{ p: 2 }}>
                    <Grid container spacing={1} direction={'column'}>
                        <Grid item>

                        </Grid>
                        <Grid item>
                            <PaysGrid title={''} paysList={customerPaysList} hideCustomer={true} heightGrid={'60vh'} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button variant={'outlined'} onClick={() => {  setOpenPaysDialog(false) }}>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
