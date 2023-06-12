import React, { useState, useEffect } from 'react'
import AppDataGrid from '../../AppDataGrid'
import { GridActionsCellItem } from '@mui/x-data-grid'
import DeleteIcon from '@mui/icons-material/Delete'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField } from '@mui/material'


export default function ProfilesGrid() {
    const { update } = props
    const [gridApiRef, setGridApiRef] = useState(null)
    const [rowData, setRowData] = useState([])
    const [profilesList, setProfilesList] = useState([])

    
    return (
        <>
            <AppDataGrid title='Perfiles' rows={profilesList} columns={columns} height='80vh' setGridApiRef={setGridApiRef} />
        </>
    )
}




function rowDataDefault() {
    return ({
        id: 0,
        name: '',
        un_lock: false,
        config: false,
        products: false,
        users: false,
        accounting: false,
    })
}