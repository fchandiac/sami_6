import React, { useState, useEffect } from 'react'
import AppDataGrid from '../../AppDataGrid/AppDataGrid'
import { useAppContext } from '../../../AppProvider'
import { GridActionsCellItem } from '@mui/x-data-grid'
import DeleteIcon from '@mui/icons-material/Delete'
import { Dialog, DialogActions, DialogTitle, DialogContent, Grid, TextField, Button } from '@mui/material'

import electron from 'electron'

import moment from 'moment'
import AppInfoDataGrid from '../../AppInfoDataGrid/AppInfoDataGrid'
const ipcRenderer = electron.ipcRenderer || false

const utils = require('../../../utils')


export default function MovementsGrid() {
    const { movements, dispatch, lock, user } = useAppContext()
    const [gridApiRef, setGridApiRef] = useState(null)
    const [rowData, setRowData] = useState(rowDataDefault())
    const [movementsList, setMovementsList] = useState([])
    const [openDestroyDialog, setOpenDestroyDialog] = useState(false)

    useEffect(() => {
        let data = movements.movements.map((item, index) => ({
            id: index + 1000,
            user: item.user,
            type: getMovementType(item.type),
            sale_id: item.sale_id,
            dteType: getDteType(item.dte_code),
            dteNumber: item.dte_number == 0 ? 'Sin DTE' : item.dte_number,
            amount: item.amount,
            paymentMethod: item.payment_method,
            balance: item.balance,
            date: moment(item.date).format('HH:mm:ss'),
        }))
        data.reverse()
        setMovementsList(data)
    }, [movements])

    const getMovementType = (typeCode) => {
        switch (typeCode) {
            case 1001: return 'Apertura'
            case 1002: return 'Ingreso'
            case 1003: return 'Egreso'
            case 1004: return 'Venta'
            case 1005: return 'nota de crédito'
            case 1006: return 'Cierre'
            case 1007: return 'Venta eliminada'
            default: return ''
        }
    }

    const getDteType = (dteCode) => {
        switch (dteCode) {
            case 33: return 'Factura'
            case 34: return 'Factura Exenta'
            case 61: return 'Nota de crédito'
            case 56: return 'Nota de débito'
            case 39: return 'Boleta'
            default: return 'Sin DTE'
        }
    }

    const destroy = () => {
        let mov = movements.movements.find((item, index) => index == (rowData.id - 1000))
        let movs = movements.movements
        movs[rowData.id - 1000].type = 1007
        let newMov = {
            sale_id: 0,
                user: user.name,
                type: 1005,
                amount: mov.amount * -1,
                payment_method: '-', 
                balance: movements.balance - mov.amount,
                dte_code: 0,
                dte_number: 0,
                date: new Date()
        }
        movs.push(newMov)

        let newMovs = {
            state: true,
            balance: movements.balance - mov.amount,
            movements: movs
          }


        ipcRenderer.send('update-movements', newMovs)
        dispatch({ type: 'SET_MOVEMENTS', value: newMovs })
        setOpenDestroyDialog(false)    


    }

    const displayDestroy = (type) =>  {
        if (lock == true){
            return false
        } else {
            switch(type) {
                case 'Apertura': return false
                case 'Ingreso': return false
                case 'Egreso': return false
                case 'Venta': return true
                case 'Cierre': return false
                case 'nota de crédito': return false
                default: return false
            }
        }
    }

    const columns = [
        { field: 'id', headerName: 'Id', flex: .3, type: 'number' },
        { field: 'user', headerName: 'Usuario', flex: .5 },
        { field: 'type', headerName: 'Tipo', flex: .5 },
        { field: 'sale_id', headerName: 'Venta', flex: .3, type: 'number' },
        { field: 'paymentMethod', headerName: 'Medio de pago', flex: .5 },
        { field: 'dteType', headerName: 'DTE', flex: .4 },
        { field: 'dteNumber', headerName: 'N° DTE', flex: .4, type: 'number' },
        { field: 'amount', headerName: 'Monto', flex: .5, type: 'number', valueFormatter: (params) => (utils.renderMoneystr(params.value)) },
        { field: 'balance', headerName: 'Balance', flex: .5, type: 'number', valueFormatter: (params) => (utils.renderMoneystr(params.value)) },
        { field: 'date', headerName: 'Hora', flex: .5 },
        {
            field: 'actions',
            headerName: '',
            headerClassName: 'data-grid-last-column-header',
            type: 'actions', flex: .6, getActions: (params) => [
                <GridActionsCellItem
                    sx={{display:  displayDestroy(params.row.type) ? 'block' : 'none'}}
                    label='delete'
                    icon={<DeleteIcon />}
                    onClick={() => {
                        setRowData({
                            rowId: params.id,
                            id: params.row.id,
                            amount: params.row.amount,
                            paymentMethod: params.row.paymentMethod,
                            date: params.row.date,
                        })
                        setOpenDestroyDialog(true)
                    }}
                />]}
    ]

    return (
        <>
            <AppInfoDataGrid 
            title={'Movimientos de caja'} 
            rows={movementsList} columns={columns} 
            height='80vh' 
            setGridApiRef={setGridApiRef} 
            gridApiRef={gridApiRef} 
            infoField={'amount'}
            infoTitle={'Total movimientos'}
            money={true}
            />
              <Dialog open={openDestroyDialog} maxWidth={'xs'} fullWidth>
                <DialogTitle sx={{ p: 2 }}>
                    Eliminar Movimiento
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
                                    label="Moento"
                                    value={utils.renderMoneystr(rowData.amount)}
                                    inputProps={{ readOnly: true }}
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    label="Medio de pago"
                                    value={rowData.paymentMethod}
                                    inputProps={{ readOnly: true }}
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    label="Hora"
                                    value={rowData.date}
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

function rowDataDefault () {
    return ({
        rowId: 0,
        id: 0,
        amount: 0,
        paymentMethod: '',
        date: new Date()
    })
}
