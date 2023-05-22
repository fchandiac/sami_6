import {
    Box, Card, Stack, Typography, Badge, IconButton, Dialog, DialogActions, DialogTitle, DialogContent,
    Grid, TextField, Button
} from '@mui/material'
import React, { useState } from 'react'

import WidgetsIcon from '@mui/icons-material/Widgets'
import NotificationsIcon from '@mui/icons-material/Notifications'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle'
import EditNotificationsIcon from '@mui/icons-material/EditNotifications'
import DeleteIcon from '@mui/icons-material/Delete'

import { useAppContext } from '../../../AppProvider'

import { useTheme } from '@mui/material/styles'
const stocks = require('../../../promises/stocks')

export default function StockCard(props) {
    const { stock, updateComponent, setUpdateComponent } = props
    const theme = useTheme()
    const { dispatch } = useAppContext()
    const [openAddDialog, setOpenAddDialog] = useState(false)
    const [openRemoveDialog, setOpenRemoveDialog] = useState(false)
    const [openUpdateAlertDialog, setOpenUpdateAlertDialog] = useState(false)
    const [stockToAdd, setStockToAdd] = useState(0)
    const [stockToRemove, setStockToRemove] = useState(0)
    const [criticalStockToUpdate, setCriticalStockToUpdate] = useState(0)

    const addStock = () => {
        stocks.updateByProductAndStorage(stock.product_id, stock.storage_id, (parseInt(stock.stock) + parseInt(stockToAdd)), stock.critical_stock)
            .then(() => {
                setStockToAdd(0)
                setUpdateComponent(!updateComponent)
                setOpenAddDialog(false)
                stocks.findAllStockAlert()
                .then(res => { 
                    dispatch({ type: 'SET_STOCK_ALERT_LIST', value: res 
                }) })
                .catch(err => { console.log(err) })
            })
            .catch(err => { console.error(err) })
    }
    const removeStock = () => {
        stocks.updateByProductAndStorage(stock.product_id, stock.storage_id, stock.stock - stockToRemove, stock.critical_stock)
            .then(() => {
                setStockToRemove(0)
                setUpdateComponent(!updateComponent)
                setOpenRemoveDialog(false)
                stocks.findAllStockAlert()
                .then(res => { 
                    dispatch({ type: 'SET_STOCK_ALERT_LIST', value: res 
                }) })
                .catch(err => { console.log(err) })
            })
            .catch(err => { console.error(err) })
    }
    const updateCriticalStock = () => {
        stocks.updateByProductAndStorage(stock.product_id, stock.storage_id, stock.stock, criticalStockToUpdate)
            .then(() => {
                setCriticalStockToUpdate(0)
                setUpdateComponent(!updateComponent)
                setOpenUpdateAlertDialog(false)
                stocks.findAllStockAlert()
                    .then(res => { 
                        dispatch({ type: 'SET_STOCK_ALERT_LIST', value: res 
                    }) })
                    .catch(err => { console.log(err) })
            })
            .catch(err => { console.error(err) })

    }
    const destroyStock = () => {
        stocks.destroy(stock.id)
            .then(() => {
                setUpdateComponent(!updateComponent)
                stocks.findAllStockAlert()
                    .then(res => { 
                        dispatch({ type: 'SET_STOCK_ALERT_LIST', value: res 
                    }) })
                    .catch(err => { console.log(err) })
            })
            .catch(err => { console.error(err) })
    }

    return (
        <>
            <Card variant={'outlined'}>
                <Box sx={{ backgroundColor: theme.palette.primary.main, textAlign: 'right' }}>
                    <Typography variant={'caption'} paddingRight={1} color={theme.palette.primary.contrastText}>
                        {stock.Storage.name}
                    </Typography>
                </Box>
                <Box sx={{ textAlign: 'right', padding: 1 }}>
                    <Stack direction={'row-reverse'} spacing={1} padding={1}>
                        <Badge badgeContent={stock.critical_stock} color="secondary" showZero max={10000}>
                            <NotificationsIcon fontSize={'large'} />
                        </Badge>
                        <Badge badgeContent={stock.stock} color="secondary" showZero max={10000}>
                            <WidgetsIcon fontSize={'large'} />
                        </Badge>
                    </Stack>
                    <Stack direction={'row'} spacing={1}>
                        <IconButton onClick={() => setOpenAddDialog(true)} >
                            <AddCircleIcon fontSize={'small'} />
                        </IconButton>
                        <IconButton onClick={() => setOpenRemoveDialog(true)}>
                            <RemoveCircleIcon fontSize={'small'} />
                        </IconButton>
                        <IconButton onClick={() => setOpenUpdateAlertDialog(true)}>
                            <EditNotificationsIcon fontSize={'small'} />
                        </IconButton>
                        <IconButton onClick={() => destroyStock(stock.id)} sx={{ display: stock.storage_id == 1001 ? 'none' : 'block' }} >
                            <DeleteIcon fontSize={'small'} />
                        </IconButton>
                    </Stack>
                </Box>
            </Card>
            <Dialog open={openAddDialog} fullWidth maxWidth={'xs'}>
                <DialogTitle sx={{ p: 2 }}>Agregar stock {stock.Product.name}</DialogTitle>
                <form onSubmit={(e) => { e.preventDefault(); addStock() }}>
                    <DialogContent sx={{ p: 2 }}>
                        <Grid container spacing={1} direction={'column'}>
                            <Grid item>
                                <TextField
                                    label={'Stock actual ' + stock.Storage.name}
                                    value={stock.stock}
                                    inputProps={{ readOnly: true }}
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    label="Cantidad a agregar"
                                    value={stockToAdd}
                                    onChange={(e) => { setStockToAdd(e.target.value) }}
                                    type="number"
                                    inputProps={{ min: 0 }}
                                    variant="outlined"
                                    size={'small'}
                                    autoFocus
                                    fullWidth
                                    required
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button variant="contained" type='submit'>Agregar</Button>
                        <Button variant={'outlined'} onClick={() => { setOpenAddDialog(false) }}>cerrar</Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={openRemoveDialog} fullWidth maxWidth={'xs'}>
                <DialogTitle sx={{ p: 2 }}>Reducir stock {stock.Product.name}</DialogTitle>
                <form onSubmit={(e) => { e.preventDefault(); removeStock() }}>
                    <DialogContent sx={{ p: 2 }}>
                        <Grid container spacing={1} direction={'column'}>
                            <Grid item>
                                <TextField
                                    label={'Stock actual ' + stock.Storage.name}
                                    value={stock.stock}
                                    inputProps={{ readOnly: true }}
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    label="Cantidad a reducir"
                                    value={stockToRemove}
                                    onChange={(e) => { setStockToRemove(e.target.value) }}
                                    type="number"
                                    inputProps={{ min: 0 }}
                                    variant="outlined"
                                    size={'small'}
                                    autoFocus
                                    fullWidth
                                    required
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button variant="contained" type='submit'>Reducir</Button>
                        <Button variant={'outlined'} onClick={() => { setOpenRemoveDialog(false) }}>cerrar</Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={openUpdateAlertDialog} fullWidth maxWidth={'xs'}>
                <DialogTitle sx={{ p: 2 }}>Actualizar stock crítico {stock.Product.name}</DialogTitle>
                <form onSubmit={(e) => { e.preventDefault(); updateCriticalStock() }}>
                    <DialogContent sx={{ p: 2 }}>
                        <Grid container spacing={1} direction={'column'}>
                            <Grid item>
                                <TextField
                                    label="Stock crítico"
                                    value={criticalStockToUpdate}
                                    onChange={(e) => { setCriticalStockToUpdate(e.target.value) }}
                                    type="number"
                                    inputProps={{ min: 0 }}
                                    variant="outlined"
                                    size={'small'}
                                    autoFocus
                                    fullWidth
                                    required
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button variant="contained" type='submit'>Actualizar</Button>
                        <Button variant={'outlined'} onClick={() => { setOpenUpdateAlertDialog(false) }}>cerrar</Button>
                    </DialogActions>
                </form>
            </Dialog>


        </>
    )
}
