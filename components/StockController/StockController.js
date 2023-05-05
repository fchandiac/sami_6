import React, { useState, useEffect } from 'react'
import AppPaper from '../AppPaper/AppPaper'
import {
    Grid, TextField, Chip, Stack, Dialog, DialogActions, DialogTitle, DialogContent,
    Button, Autocomplete
} from '@mui/material'
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import StockCard from '../Cards/StockCard/StockCard'
import { useAppContext } from '../../AppProvider'
import Movement from './Movement/Movement'

const stocks = require('../../promises/stocks')




export default function StockController(props) {
    const { productId, gridApiRef } = props
    const { dispatch } = useAppContext()
    const [productStocks, setProductStocks] = useState([])
    const [stockData, setStockData] = useState(stockDataDefault())
    const [totalStock, setTotalStock] = useState(0)
    const [openNewStockDialog, setOpenNewStockDialog] = useState(false)
    const [storagesInput, setStoragesInput] = useState('')
    const [storagesOptions, setStoragesOptions] = useState([])
    const [updateComponent, setUpdateComponent] = useState(false)
    const [openNewStorageDialog, setOpenNewStorageDialog] = useState(false)
    const [newStorageName, setNewStorageName] = useState('')


    useEffect(() => {
        stocks.findAllByProductId(productId)
            .then(res => {
                let stocksData = res
                let totalStock = res.reduce((accumulator, currentValue) => { return accumulator + currentValue.stock; }, 0)
                let salesRoomStock = res.filter(item => item.storage_id === 1001).map(item => item.stock)
                console.log(salesRoomStock)
                gridApiRef.current.updateRows([{
                        id: productId,
                       stock: totalStock,
                       salesRoomStock: salesRoomStock[0] ? salesRoomStock[0] : 0
                    }])

                setProductStocks(res)
                setTotalStock(totalStock)
                stocks.storagesFindAll()
                    .then(res => {
                        let data = res.map((storage) => ({
                            key: storage.id,
                            id: storage.id,
                            label: storage.name
                        }))
                        data = data.filter(storage => {
                            return !stocksData.some(stock => stock.storage_id === storage.id)
                        })
                        setStoragesOptions(data)
                    })
                    .catch(err => { console.error(err) })
            })
            .catch(err => { console.error(err) })
    }, [updateComponent])

    const newStock = () => {
        stocks.create(productId, stockData.storage.id, stockData.stock, stockData.critical_stock)
            .then(() => {
                setStockData(stockDataDefault())
                setOpenNewStockDialog(false)
                setUpdateComponent(!updateComponent)
            })
            .catch(err => {
                console.error(err)
            })
    }

    const newStorage = () => {
        stocks.createStorage(newStorageName)
            .then(() => {
                setOpenNewStorageDialog(false)
                setUpdateComponent(!updateComponent)
                setNewStorageName('')
            })
            .catch(err => {
                console.error(err)
                if (err.errors[0].message === 'name must be unique') {
                    dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'Nombre del almacén ya existe' } })

                }
            })
    }


    return (
        <>
            <AppPaper title={'Stocks'}>
                <Grid container spacing={1}>
                    <Grid item xs={12}>
                        <Stack direction={'row-reverse'} spacing={1} padding={1}>
                            <Chip
                                label="Nuevo stock"
                                onDelete={() => { setOpenNewStockDialog(true) }}
                                onClick={() => { setOpenNewStockDialog(true) }}
                                color={'primary'}
                                deleteIcon={<AddCircleOutlineOutlinedIcon />}
                            />
                            <TextField
                                label="Stock total"
                                value={totalStock}
                                InputProps={{
                                    readOnly: true,
                                }}
                                variant="outlined"
                                size={'small'}
                                fullWidth
                            />
                        </Stack>
                    </Grid>
                    <Grid item xs={12} margin={1}>
                        <Grid container spacing={1}>
                            {productStocks.map((stock, index) => (
                                <Grid item xs={4} key={index}>
                                    <StockCard stock={stock} updateComponent={updateComponent} setUpdateComponent={setUpdateComponent} />
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                    <Grid item xs={12} margin={1}>
                        <Movement productId={productId} updateComponent={updateComponent} setUpdateComponent={setUpdateComponent} />
                    </Grid>
                </Grid>
            </AppPaper>

            <Dialog open={openNewStockDialog} fullWidth maxWidth={'sm'}>
                <DialogTitle sx={{ p: 2 }}>Nuevo stock</DialogTitle>
                <form onSubmit={(e) => { e.preventDefault(); newStock() }}>
                    <DialogContent sx={{ p: 2 }}>
                        <Grid container spacing={1} direction={'column'}>
                            <Grid item>
                                <Stack direction={'row-reverse'} spacing={1} >
                                    <Chip
                                        label="Nuevo almacén"
                                        onDelete={() => { setOpenNewStorageDialog(true) }}
                                        onClick={() => { setOpenNewStorageDialog(true) }}
                                        color={'primary'}
                                        deleteIcon={<AddCircleOutlineOutlinedIcon />}
                                    />
                                    <Autocomplete
                                        inputValue={storagesInput}
                                        onInputChange={(e, newInputValue) => {
                                            setStoragesInput(newInputValue)
                                        }}
                                        isOptionEqualToValue={(option, value) => null || option.id === value.id}
                                        value={stockData.storage}
                                        onChange={(e, newValue) => {
                                            setStockData({ ...stockData, storage: newValue })
                                        }}
                                        fullWidth
                                        disablePortal
                                        options={storagesOptions}
                                        renderInput={(params) => <TextField {...params} label='Almacén' size={'small'} fullWidth required />}
                                    />
                                </Stack>
                            </Grid>
                            <Grid item>
                                <TextField
                                    label="Stock"
                                    value={stockData.stock}
                                    onChange={(e) => { setStockData({ ...stockData, stock: e.target.value }) }}
                                    type="number"
                                    inputProps={{ min: 0 }}
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    label="Stock crítico"
                                    value={stockData.critical_stock}
                                    onChange={(e) => { setStockData({ ...stockData, critical_stock: e.target.value }) }}
                                    type="number"
                                    inputProps={{ min: 0 }}
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                    required
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button variant="contained" type='submit'>Guardar</Button>
                        <Button variant={'outlined'} onClick={() => { setOpenNewStockDialog(false); setNewStorageName('') }}>cerrar</Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={openNewStorageDialog} fullWidth maxWidth={'xs'}>
                <DialogTitle sx={{ p: 2 }}>Nuevo almacén</DialogTitle>
                <form onSubmit={(e) => { e.preventDefault(); newStorage() }}>
                    <DialogContent sx={{ p: 2 }}>
                        <Grid container spacing={1} direction={'column'}>
                            <Grid item>
                                <TextField
                                    label='Nombre'
                                    value={newStorageName}
                                    onChange={(e) => { setNewStorageName(e.target.value) }}
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                    required
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button variant="contained" type='submit'>Guardar</Button>
                        <Button variant={'outlined'} onClick={() => { setOpenNewStorageDialog(false) }}>cerrar</Button>
                    </DialogActions>
                </form>
            </Dialog>

        </>
    )
}

function stockDataDefault() {
    return {
        storage: { id: 0, key: 0, label: '' },
        stock: 0,
        critical_stock: 0
    }
}