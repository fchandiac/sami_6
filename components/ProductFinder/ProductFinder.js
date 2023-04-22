import React, { useState, useEffect } from 'react'
import AppDataGrid from '../AppDataGrid/AppDataGrid'
import { GridActionsCellItem } from '@mui/x-data-grid'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import { useAppContext } from '../../AppProvider'

const products = require('../../promises/products')
const utils = require('../../utils')

export default function ProductFinder() {
    const { dispatch } = useAppContext()
    const [gridApiRef, setGridApiRef] = useState(null)
    const [rowData, setRowData] = useState(rowDataDefault())
    const [productsList, setProductsList] = useState([])

    useEffect(() => {
        products.findAll().then(res => {
            let data = res.map((item) => ({
                id: item.id,
                name: item.name,
                code: item.code,
                sale: item.Price.sale,
            }))
            setProductsList(data)
        })
    }, [])

    const addToCart = (product) => {
        dispatch({ type: 'ADD_TO_CART', value: product })
    }

    const columns = [
        { field: 'id', headerName: 'Id', flex: .3, type: 'number' },
        { field: 'name', headerName: 'Nombre', flex: 1 },
        { field: 'code', headerName: 'Código', flex: 1 },
        { field: 'sale', headerName: 'Precio Venta', flex: .5, valueFormatter: (params) => (utils.renderMoneystr(params.value)) },
        {
            field: 'actions',
            headerName: '',
            type: 'actions', flex: .5, getActions: (params) => [
                <GridActionsCellItem
                    label='addToCart'
                    icon={<ShoppingCartIcon />}
                    onClick={() => {
                        addToCart({
                            id: params.row.id,
                            name: params.row.name,
                            quanty: 1,
                            sale: params.row.sale,
                            subTotal: params.row.sale,
                            discount: 0
                        })
                    }}
                />
            ]
        }
    ]


    return (
        <>
            <AppDataGrid title='Productos' rows={productsList} columns={columns} height='70.7vh' setGridApiRef={setGridApiRef} />
        </>
    )
}


function rowDataDefault() {
    return {
        id: 0,
        name: '',
        code: '',
        sale: 0,
    }
}