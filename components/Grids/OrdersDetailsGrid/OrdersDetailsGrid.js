import React, {useState} from 'react'
import AppDataGrid from '../../AppDataGrid'
import { GridActionsCellItem } from '@mui/x-data-grid'

const utils = require('../../../utils')

export default function OrdersDetailsGrid(props) {
    const { detailsList } = props
    const [gridApiRef, setGridApiRef] = useState(null)
    const [rowData, setRowData] = useState([])


    const columns = [
        { field: 'id', headerName: 'Id', flex: .3, type: 'number', hide: true },
        { field: 'name', headerName: 'Producto', flex: 1 },
        { field: 'quanty', headerName: 'Cantidad', flex: .3, type: 'number' },
        { field: 'sale', headerName: 'Precio', flex: .3, type: 'number', valueFormatter: (params) => utils.renderMoneystr(params.value) },
        { field: 'discount', headerName: 'Descuento', flex: .3, type: 'number' },
        { field: 'subtotal', headerName: 'Subtotal', flex: .3, type: 'number', valueFormatter: (params) => utils.renderMoneystr(params.value),  headerClassName: 'data-grid-last-column-header' }
    ]


    return (
        <>
            <AppDataGrid title='Detalle' rows={detailsList} columns={columns} height='50vh' setGridApiRef={setGridApiRef} />
        </>
    )
}
