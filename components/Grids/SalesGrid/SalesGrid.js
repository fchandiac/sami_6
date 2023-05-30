import React, { useState, useEffect } from 'react'
import AppDataGrid from '../../AppDataGrid'
import { GridActionsCellItem } from '@mui/x-data-grid'
import DeleteIcon from '@mui/icons-material/Delete'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, Autocomplete } from '@mui/material'

import AppInfoDataGrid from '../../AppInfoDataGrid'
import moment from 'moment'

const sales = require('../../../promises/sales')
const utils = require('../../../utils')

export default function SalesGrid(props) {
    const { filterDates } = props
    const [gridApiRef, setGridApiRef] = useState(null)
    const [rowData, setRowData] = useState([])
    const [salesList, setSalesList] = useState([])
    const [openDestroyDialog, setOpenDestroyDialog] = useState(false)


    useEffect(() => {
        sales.findAllBetweenDates(filterDates.start, filterDates.end)
            .then((res) => {
                let data = res.map((item) => ({
                    id: item.id,
                    amount: item.amount,
                    date: item.createdAt,
                    dte_code: dteString(item.dte_code),
                    dte_number: item.dte_number,
                    payment_method: item.payment_method
                }))
                setSalesList(data)
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

    const columns = [
        { field: 'id', headerName: 'Id', flex: .3, type: 'number' },
        { field: 'amount', headerName: 'Monto', flex: 1, type: 'number', valueFormatter: (params) => utils.renderMoneystr(params.value) },
        { field: 'payment_method', headerName: 'Método de pago', flex: 1 },
        { field: 'dte_code', headerName: 'DTE', flex: 1 },
        { field: 'dte_number', headerName: 'N° DTE', flex: 1 },
        { field: 'date', headerName: 'Fecha', flex: 1, type: 'dateTime', valueFormatter: (params) => moment(params.value).format('DD-MM-YYYY HH:mm') },
        // {
        //     field: 'actions',
        //     headerName: '',
        //     headerClassName: 'data-grid-last-column-header',
        //     type: 'actions', flex: .2, getActions: (params) => [
        //         <GridActionsCellItem
        //             label='delete'
        //             icon={<DeleteIcon />}
        //             onClick={() => {
        //                 setRowData({
        //                     rowId: params.id,
        //                     id: params.row.id,
        //                     name: params.row.name,
        //                 })
        //                 setOpenDestroyDialog(true)
        //             }}
        //         />]
        // }
    ]

    return (
        <>

            <AppInfoDataGrid
                title='Ventas'
                rows={salesList}
                columns={columns}
                height='80vh'
                setGridApiRef={setGridApiRef}
                infoField={'amount'}
                infoTitle={'Total ventas: '}
                money={true}
            />

            {/* <Dialog open={openDestroyDialog} maxWidth={'xs'} fullWidth>
                <DialogTitle sx={{ p: 2 }}>
                    Eliminar categoría
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
            </Dialog> */}
        </>
    )
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