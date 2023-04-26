import React, { useState, useEffect } from 'react'
import AppDataGrid from '../../AppDataGrid/AppDataGrid'

const stoks =  require('../../../promises/stocks')

export default function StocksGrid(props) {
    const { updateGrid } = props
    const [gridApiRef, setGridApiRef] = useState(null)
    const [rowData, setRowData] = useState(null)
    const [stocksList, setStocksList] = useState([])

    useEffect(() => {
        stoks.findAllGroupByProduct()
        .then(res => {
            let data = res.map(item => ({
                id: item.product_id,
                ProductName: item.Product.name,
                total_stock: item.total_stock
            }))
            setStocksList(data)

        })
        .catch(err => {console.log(err)})
    }, [updateGrid])
    



    const columns = [
        { field: 'id', headerName: 'Id', flex: .3, type: 'number' },
        { field: 'ProductName', headerName: 'Producto', flex: 1 },
        { field: 'total_stock', headerName: 'Stock', flex: .5, type: 'number' },
    ]

    return (
        <AppDataGrid title={'Stocks '} rows={stocksList} columns={columns} height='80vh' setGridApiRef={setGridApiRef} />
    )
}
