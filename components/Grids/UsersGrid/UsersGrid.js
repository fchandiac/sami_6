import React, { useState, useEffect } from 'react'
import AppDataGrid from '../../AppDataGrid'
import { GridActionsCellItem } from '@mui/x-data-grid'
import DeleteIcon from '@mui/icons-material/Delete'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField} from '@mui/material'


const users = require('../../../promises/users')

export default function UsersGrid(props) {
    const { update } = props
    const [gridApiRef, setGridApiRef] = useState(null)
    const [rowData, setRowData] = useState(rowDataDefault())
    const [usersList, setUsersList] = useState([])
    const [openDestroyDialog, setOpenDestroyDialog] = useState(false)


    useEffect(() => {
        users.findAll()
            .then((res) => {
                let data = res.map(item => ({
                    id: item.id,
                    user: item.user,
                    name: item.name,
                    profile: item.Profile.name,
                }))
                setUsersList(data)
            })
            .catch((err) => { })
    },
        [update])

    const destroy = () => {
        users.destroy(rowData.id)
            .then(() => {
                gridApiRef.current.updateRows([{ id: rowData.rowId, _action: 'delete' }])
                setOpenDestroyDialog(false)
            })
            .catch(err => { console.error(err) })
    }

    const columns = [
        { field: 'id', headerName: 'Id', flex: .3, type: 'number' },
        { field: 'user', headerName: 'Nombre de usuario', flex: 1 },
        { field: 'name', headerName: 'Funcionario', flex: 1 },
        { field: 'profile', headerName: 'Perfil', flex: 1 },
        {
            field: 'actions',
            headerName: '',
            headerClassName: 'data-grid-last-column-header',
            type: 'actions', flex: .2, getActions: (params) => [
                <GridActionsCellItem
                    sx={{display: params.row.id === 1001 ? 'none' : 'flex-inline'}}
                    label='delete'
                    icon={<DeleteIcon />}
                    onClick={() => {
                        setRowData({
                            rowId: params.id,
                            id: params.row.id,
                            name: params.row.name,
                        })
                        setOpenDestroyDialog(true)
                    }}
                />]
        }
    ]

    return (
        <>
            <AppDataGrid title='Usuarios' rows={usersList} columns={columns} height='80vh' setGridApiRef={setGridApiRef} />
            <Dialog open={openDestroyDialog} maxWidth={'xs'} fullWidth>
                <DialogTitle sx={{ p: 2 }}>
                    Eliminar usuario
                </DialogTitle>
                <form onSubmit={(e) => { e.preventDefault(); destroy() }}>
                    <DialogContent sx={{ p: 2 }}>
                        <Grid container spacing={1} direction={'column'}>
                            <Grid item>
                                <TextField
                                    label="Id"
                                    value={rowData.id}
                                    inputProps={{ readOnly: true }}
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    label="Nombre"
                                    value={rowData.user}
                                    inputProps={{ readOnly: true }}
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                />
                            </Grid>

                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button variant={'contained'} type={'submit'}>Eliminar</Button>
                        <Button variant={'outlined'} onClick={() => setOpenDestroyDialog(false)}>Cerrar</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    )
}

function rowDataDefault() {
    return {
        user: '',
        name: '',
        pass: '',
        profile: { id: 0, key: 0, label: '' }
    }
}
