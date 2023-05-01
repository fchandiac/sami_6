import React, {useState, useEffect} from 'react'
import AppDataGrid from '../../AppDataGrid'
import { GridActionsCellItem } from '@mui/x-data-grid'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, Autocomplete } from '@mui/material'


const categories = require('../../../promises/categories')

export default function CategoriesGrid(props) {
    const { update } = props
    const [gridApiRef, setGridApiRef] = useState(null)
    const [rowData, setRowData] = useState([])
    const [categoriesList, setCategoriesList] = useState([])
    const [openDestroyDialog, setOpenDestroyDialog] = useState(false)
    const [openInfoDialog, setOpenInfoDialog] = useState(false)

    useEffect(() => {
        categories.findAll()
        .then((res) => {
            setCategoriesList(res)
        })
        .catch((err) => {})
    },
    [update])

    const columns = [
        { field: 'id', headerName: 'Id', flex: .3, type: 'number' },
        { field: 'name', headerName: 'Name', flex: 1 },
    ]

  return (
    <>
        <AppDataGrid title='Categorias' rows={categoriesList} columns={columns} height='80vh' setGridApiRef={setGridApiRef} />
    
    </>
  )
}
