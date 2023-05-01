import { Grid, Autocomplete, TextField, Button, IconButton, Stack } from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import React, { useState, useEffect } from 'react'
import StocksGrid from '../components/Grids/StocksGrid/StocksGrid'
import AppPaper from '../components/AppPaper/AppPaper'
import { useAppContext } from '../AppProvider'

const { storagesFindAll, findAllByProductId, updateByProductAndStorage } = require('../promises/stocks')
const products = require('../promises/products')

export default function stocks() {
    const { dispatch } = useAppContext()
    const [storagesOptions, setStoragesOptions] = useState([])
    const [storagesInput, setStoragesInput] = useState('')
    const [storage, setStorage] = useState({ key: 1001, id: 1001, label: 'Sala de ventas' })
    const [productsOptions, setProductsOptions] = useState([])
    const [productsInput, setProductsInput] = useState('')
    const [product, setProduct] = useState({ key: 0, id: 0, label: '' })
    const [addStockQuanty, setAddStockQuanty] = useState(0)
    const [updateGrid, setUpdateGrid] = useState(false)

    // useEffect(() => {
    //     storagesFindAll().then(res => {
    //         let data = res.map(item => ({
    //             key: item.id,
    //             id: item.id,
    //             label: item.name
    //         }))
    //         setStoragesOptions(data)
    //     })
    //         .catch(err => { console.error(err) })
    // }, [])

    useEffect(() => {
        products.findAll()
            .then(res => {
                let data = res.map(item => ({
                    key: item.id,
                    id: item.id,
                    label: item.name
                }))
                setProductsOptions(data)
            })
            .catch(err => { console.error(err) })
    }, [])

    const updateStock = () => {
        findAllByProductId(product.id)
            .then(res => {
                let salesRoom = res.find(item => item.storage_id == 1001)
                console.log(salesRoom)
                updateByProductAndStorage(product.id, storage.id, (parseInt(addStockQuanty) + salesRoom.stock))
                    .then(() => {
                        dispatch({ type: 'OPEN_SNACK', value: { type: 'success', message: 'Stock actualizado' } })
                        setProduct({ key: 0, id: 0, label: '' })
                        setStorage({ key: 1001, id: 1001, label: 'Sala de ventas' })
                        setAddStockQuanty(0)
                        setUpdateGrid(!updateGrid)
                    })
                    .catch(err => { console.error(err) })

            })
            .catch(err => { console.error(err) })
    }


    return (
        <>
            <Grid container spacing={1}>
                <Grid item xs={4}>
                    <AppPaper title={'Agregar Stock'}>
                        <form onSubmit={(e) => { e.preventDefault(); updateStock() }}>
                            <Grid container spacing={1} direction={'column'} padding={1}>
                                <Grid item >
                                    <Stack direction={'row'} spacing={1}>
                                        <IconButton onClick={() => { console.log('add storage') }}>
                                            <AddCircleIcon />
                                        </IconButton>
                                        <Autocomplete
                                            sx={{ width: '100%' }}
                                            inputValue={storagesInput}
                                            onInputChange={(e, newInputValue) => {
                                                setStoragesInput(newInputValue)
                                            }}
                                            isOptionEqualToValue={(option, value) => null || option.id === value.id}
                                            value={(storage == null ? '' : storage.label)}
                                            onChange={(e, newValue) => {
                                                setStorage(newValue)
                                            }}
                                            disablePortal
                                            options={storagesOptions}
                                            renderInput={(params) => <TextField {...params} label='Almacén' size={'small'} fullWidth required />}
                                        />

                                    </Stack>

                                </Grid>

                                <Grid item >
                                    <Autocomplete
                                        inputValue={productsInput}
                                        onInputChange={(e, newInputValue) => {
                                            setProductsInput(newInputValue)
                                        }}
                                        isOptionEqualToValue={(option, value) => null || option.id === value.id}
                                        value={(product == null ? '' : product.label)}
                                        onChange={(e, newValue) => {
                                            console.log(newValue)
                                            setProduct(newValue)
                                        }}
                                        noOptionsText="Productor no encontrado"
                                        disablePortal
                                        options={productsOptions}
                                        renderInput={(params) => <TextField {...params} label='Producto' size={'small'} fullWidth required />}
                                    />
                                </Grid>
                                <Grid item>
                                    <TextField
                                        label="Cantidad"
                                        value={addStockQuanty}
                                        onChange={(e) => { setAddStockQuanty(e.target.value) }}
                                        type={'number'}
                                        variant="outlined"
                                        size={'small'}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item textAlign={'right'}>
                                    <Button variant={'contained'} type={'submit'}>Agregar</Button>
                                </Grid>

                            </Grid>
                        </form>
                    </AppPaper>
                </Grid>
                <Grid item xs={8}>
                    <StocksGrid updateGrid={updateGrid} />
                </Grid>
            </Grid>
        </>
    )
}
