import React, { useEffect, useState } from 'react'
import AppInfoDataGrid from '../../AppInfoDataGrid/AppInfoDataGrid'
import moment from 'moment'

const salesDetails = require('../../../promises/salesDetails')
const utils = require('../../../utils')

export default function SalesProductsGrid(props) {
    const { filterDates } = props
    const [gridApiRef, setGridApiRef] = useState(null)
    const [rowData, setRowData] = useState(rowDataDefault())
    const [title, setTitle] = useState('Ventas por producto')
    const [productsList, setProductsList] = useState([])
    const [openDestroyDialog, setOpenDestroyDialog] = useState(false)

    useEffect(() => {
        if (moment(filterDates.start).format('DD-MM-YYYY') == moment(filterDates.end).format('DD-MM-YYYY')){
            setTitle('Ventas por producto del ' + moment(filterDates.start).format('DD-MM-YYYY'))
        } else {
            setTitle('Ventas por producto del ' + moment(filterDates.start).format('DD-MM-YYYY') + ' al ' + moment(filterDates.end).format('DD-MM-YYYY'))
        }

    }, [filterDates])

    useEffect(() => {
        salesDetails.findAllBetweenDateGroupByProduct(filterDates.start, filterDates.end)
            .then(res => {
                let data = res.filter(item => item.Product != null)
                data = data.map(item => ({
                    id: item.ProductId,
                    name: item.Product.name,
                    code: item.Product.code,
                    category: item.Product.Category.name,
                    amount: parseInt(item.total_amount),
                    quanty: item.total_quanty
                }))
                setProductsList(data)
            })
            .catch(err => console.log(err))
    }, [])

    const columns = [
        { field: 'id', headerName: 'Id', flex: .3, type: 'number' },
        { field: 'name', headerName: 'Producto', flex: 1, type: 'string' },
        { field: 'code', headerName: 'Código', flex: 1, type: 'string' },
        { field: 'category', headerName: 'Categoría', flex: 1, type: 'string' },
        { field: 'amount', headerName: 'Monto', flex: 1, type: 'number', valueFormatter: (params) => utils.renderMoneystr(params.value) },
        { field: 'quanty', headerName: 'Cantidad', flex: 1, type: 'number' },
        // { field: 'date', headerName: 'Fecha', flex: 1, type: 'dateTime', valueFormatter: (params) => moment(params.value).format('DD-MM-YYYY HH:mm') },
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
        //                     amount: params.row.amount,
        //                 })
        //                 setOpenDestroyDialog(true)
        //             }}
        //         />]
        // }
    ]



    return (
        <>
            <AppInfoDataGrid
                title={title}
                rows={productsList}
                columns={columns}
                height='80vh'
                setGridApiRef={setGridApiRef}
                infoField={'amount'}
                infoTitle={'Total ventas: '}
                money={true}
            />
        </>
    )
}


function rowDataDefault() {
    return {
        id: 0,
        // amount: 0,
        // date: '',
        // dte_code: 0,
        // dte_number: 0,
        // payment_method: 0,
        // stock_control: false
    }
}