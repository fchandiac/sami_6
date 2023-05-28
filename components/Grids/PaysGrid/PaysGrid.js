import React, {useState, useEffect} from 'react'
import AppDataGrid from '../../AppDataGrid'
import { GridActionsCellItem } from '@mui/x-data-grid'
import DeleteIcon from '@mui/icons-material/Delete'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, Autocomplete } from '@mui/material'
import moment from 'moment'

const pays = require('../../../promises/pays')
const utils = require('../../../utils')

export default function CategoriesGrid(props) {
    const { update } = props
    const [gridApiRef, setGridApiRef] = useState(null)
    const [rowData, setRowData] = useState([])
    const [paysList, setPaysList] = useState([])
    const [openDestroyDialog, setOpenDestroyDialog] = useState(false)
  

    useEffect(() => {
        pays.findAll()
        .then((res) => {
            let data = res.map((item) => ({
                id: item.id,
                sale_id: item.sale_id,
                amount: item.amount,
                payment_method: item.payment_method,
                state: item.state,
                date: item.date
            }))
            setPaysList(data)
        })
        .catch(err => { console.error(err) })
    }, [])

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
        { field: 'sale_id', headerName: 'Venta', flex: 1},
        { field: 'amount', headerName: 'Monto', flex: 1, type: 'number', valueFormatter: (params) => utils.renderMoneystr(params.value) },
        { field: 'payment_method', headerName: 'Metodo de pago', flex: 1},
        { field: 'state', headerName: 'Estado', flex: 1, valueFormatter: (params) => params.value ? 'Pagado' : 'Pendiente' },
        { field: 'date', headerName: 'Fecha', flex: 1, type: 'date', valueFormatter: (params) => moment(params.value).format('DD-MM-YYYY') },
     
    ]

  return (
    <>
        <AppDataGrid title='Pagos' rows={paysList} columns={columns} height='80vh' setGridApiRef={setGridApiRef} />
   
    </>
  )
}
