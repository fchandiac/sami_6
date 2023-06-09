import React, {useState, useEffect} from 'react'
import AppDataGrid from '../../AppDataGrid'
import { GridActionsCellItem } from '@mui/x-data-grid'
import DeleteIcon from '@mui/icons-material/Delete'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, Autocomplete } from '@mui/material'

const customers = require('../../../promises/customers')

export default function CategoriesGrid(props) {
    const { update } = props
    const [gridApiRef, setGridApiRef] = useState(null)
    const [rowData, setRowData] = useState([])
    const [customersList, setCustomersList] = useState([])
    const [openDestroyDialog, setOpenDestroyDialog] = useState(false)
  

    useEffect(() => {
        customers.findAll()
        .then((res) => {
           let data = res.map(item => ({
            id  : item.id,
            name  : item.name,
            activity  : item.activity,
           }))
        
           setCustomersList(data)
        })
        .catch((err) => {})
    },[update])

    const destroy = () => {
            // categories.destroy(rowData.id)
            //     .then(() => {
            //         gridApiRef.current.updateRows([{ id: rowData.rowId, _action: 'delete' }])
            //         setOpenDestroyDialog(false)
            //     })
            //     .catch(err => { console.error(err) })
    }

    const columns = [
        { field: 'id', headerName: 'Id', flex: .3, type: 'number' },
        { field: 'name', headerName: 'Name', flex: 1.5},
        { field: 'activity', headerName: 'Actividad', flex: 1},
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
        //                     name: params.row.name,
        //                 })
        //                 setOpenDestroyDialog(true)
        //             }}
        //         />]
        // }
    ]

  return (
    <>
        <AppDataGrid title='Clientes' rows={customersList} columns={columns} height='80vh' setGridApiRef={setGridApiRef} />
        {/* <Dialog open={openDestroyDialog} maxWidth={'xs'} fullWidth>
                <DialogTitle sx={{ p: 2 }}>
                    Eliminar cliente
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
                                    value={rowData.name}
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
            </Dialog> */}
        <Dialog open={openDestroyDialog} maxWidth={'xs'} fullWidth>
                <DialogTitle sx={{ p: 2 }}>
                    Eliminar cliente
                </DialogTitle>
                <form onSubmit={(e) => { e.preventDefault(); destroy() }}>
                    <DialogContent sx={{ p: 2 }}>
                        <Grid container spacing={1} direction={'column'}>
                            <Grid item>
                                <TextField
                                    label="Id"
                                    // value={rowData.id}
                                    // inputProps={{ readOnly: true }}
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    label="Nombre"
                                    // value={rowData.name}
                                    // inputProps={{ readOnly: true }}
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
