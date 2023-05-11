import React, { useState, useEffect } from 'react'
import AppDataGrid from '../../AppDataGrid/AppDataGrid'
import { useAppContext } from '../../../AppProvider'

import electron from 'electron'

import moment from 'moment'
import AppInfoDataGrid from '../../AppInfoDataGrid/AppInfoDataGrid'
const ipcRenderer = electron.ipcRenderer || false

const utils = require('../../../utils')


export default function MovementsGrid() {
    const { movements, dispatch } = useAppContext()
    const [gridApiRef, setGridApiRef] = useState(null)
    const [rowData, setRowData] = useState(null)
    const [movementsList, setMovementsList] = useState([])

    useEffect(() => {
        //let movs = ipcRenderer.sendSync('get-movements', 'sync')
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
        { field: 'date', headerName: 'Hora', flex: .5, headerClassName: 'data-grid-last-column-header' },
    ]

    return (
        <>

            <AppDataGrid title={'Movimientos de caja'} rows={movementsList} columns={columns} height='80vh' setGridApiRef={setGridApiRef} />
            <AppInfoDataGrid title={'Movimientos de caja'} rows={movementsList} columns={columns} height='80vh' setGridApiRef={setGridApiRef} gridApiRef={gridApiRef} />
        </>
    )
}
