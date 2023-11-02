import React, { useEffect, useState } from 'react'
import AppDataGrid from '../../AppDataGrid/AppDataGrid'


const salesDetails = require('../../../promises/salesDetails')
const utile = require('../../../utils')

export default function DetailsGrid(props) {
    const { sale_id } = props
    const [detailsList, setDetailsList] = useState([])
    const [gridApiRef, setGridApiRef] = useState(null)
    const [rowData, setRowData] = useState(rowDataDefault())

    useEffect(() => {
        console.log(sale_id)
        salesDetails.findAllBySale(sale_id)
            .then(res => {
                console.log(res)
                let data = res.map((item) => ({
                    id: item.id,
                    name: item.name,
                    quanty: item.quanty,
                    sale: item.sale,
                    discount: item.discount,
                    subtotal: item.subtotal
                }))
                setDetailsList(data)
            })
            .catch(err => { console.log(err) })
    }, [])

    const columns = [
        { field: 'id', headerName: 'id', flex: 1, hide: true},
        { field: 'name', headerName: 'Producto', flex: 2 },
        { field: 'quanty', headerName: 'Cantidad', flex: 1 },
        { field: 'sale', headerName: 'Precio', flex: 1, valueFormatter: (params) => utile.renderMoneystr(params.value) },
        { field: 'discount', headerName: 'Descuento', flex: 1 },
        { field: 'subtotal', headerName: 'Subtotal', flex: 1, valueFormatter: (params) => utile.renderMoneystr(params.value), headerClassName: 'data-grid-last-column-header' }
    ]

    return (
        <>
            <AppDataGrid title='Detalle de venta' rows={detailsList} columns={columns} height='40vh' setGridApiRef={setGridApiRef} />
        </>
    )
}


function rowDataDefault() {
    return ({
        name: '',
        quanty: 0,
        sale: 0,
        discount: 0,
        subtotal: 0
    })
}