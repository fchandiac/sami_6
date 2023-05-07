import React, { useState, useEffect } from 'react'
import AppDataGrid from '../../AppDataGrid/AppDataGrid'

const stocks = require('../../../promises/stocks')

export default function StoragesGrid(props) {
    const { updateGrid } = props
    const [gridApiRef, setGridApiRef] = useState(null)
    const [rowData, setRowData] = useState(null)
    const [storagesList, setStoragesList] = useState([])

    useEffect(() => {
        let storages = []
        stocks.findAllGroupByStorage()
            .then(res => {
                storages = res.map((item) => ({
                    id: item.storage_id,
                    total_stock: item.total_stock,
                    storage_name: item.storage_name,
                    products_count: item.products_count
                }))

                stocks.storagesFindAll()
                    .then(res => {
                        let data = res.map((item) => ({
                            id: item.id,
                            total_stock: 0,
                            storage_name: item.name,
                            products_count: 0
                        }))
                        const newData = data.filter((item) => {
                            return !storages.find((storage) => storage.id == item.id);
                        }).concat(storages)
                        setStoragesList(newData)
                    })
            })
            .catch(err => { console.log(err) })

    }, [updateGrid])

    const columns = [
        { field: 'id', headerName: 'Id', flex: .3, type: 'number' },
        { field: 'storage_name', headerName: 'Nombre', flex: 1 },
        { field: 'products_count', headerName: 'Productos', flex: .5, type: 'number' },
        { field: 'total_stock', headerName: 'Stock total', flex: .5, type: 'number', headerClassName: 'data-grid-last-column-header' },
    ]

    return (
        <>
            <AppDataGrid title={'Almacenes'} rows={storagesList} columns={columns} height='80vh' setGridApiRef={setGridApiRef} />
        </>
    )
}
