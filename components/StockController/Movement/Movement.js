import React, { useState, useEffect } from 'react'
import AppPaper from '../../AppPaper/AppPaper'
import { Grid, TextField, Autocomplete, Button } from '@mui/material'
import { useAppContext } from '../../../AppProvider'

const stocks = require('../../../promises/stocks')

export default function Movement(props) {
    const { productId, updateComponent, setUpdateComponent } = props
    const { dispatch } = useAppContext()
    const [originStoragesInput, setOriginStoragesInput] = useState('')
    const [originStoragesOptions, setOriginStoragesOptions] = useState([])
    const [targetStoragesInput, setTargetStoragesInput] = useState('')
    const [targetStoragesOptions, setTargetStoragesOptions] = useState([])
    const [movementData, setMovementData] = useState(movementDataDefault())
    const [max, setMax] = useState(0)


    useEffect(() => {
        stocks.storagesFindAll()
            .then(res => {
                let data = res.map((item) => ({
                    id: item.id,
                    key: item.id,
                    label: item.name,
                    stock: 0,
                    critical_stock: 0
                }))
                setOriginStoragesOptions(data)
            })
            .catch(err => console.log(err))
    }, [])


    useEffect(() => {
        if (movementData.originStorage.id != 0) {
            stocks.storagesFindAll()
                .then(res => {

                    let data = res.map((item) => ({
                        id: item.id,
                        key: item.id,
                        label: item.name,
                        stock: 0,
                        critical_stock: 0
                    }))
                    data = data.filter((item) => item.id != movementData.originStorage.id)
                    setTargetStoragesOptions(data)
                })
                .catch(err => console.log(err))
        }

    }, [movementData.originStorage])


    const movement = () => {
        let newOriginStock = (parseFloat(movementData.originStorage.stock) - parseFloat(movementData.quanty))
        let newTargetStock = (parseFloat(movementData.targetStorage.stock) + parseFloat(movementData.quanty))

        stocks.findOneByProductAndStorage(productId, movementData.targetStorage.id)
            .then(res => {
                if (res == null){
                    stocks.create(productId, movementData.targetStorage.id, movementData.quanty, 0)
                        .then(res => {
                            stocks.updateByProductAndStorage(productId, movementData.originStorage.id, newOriginStock, movementData.originStorage.critical_stock)
                                .then(res => {
                                    setMovementData(movementDataDefault())
                                    setUpdateComponent(!updateComponent)
                                    dispatch({ type: 'OPEN_SNACK', value: { type: 'success', message: 'Movimiento realizado' } })
                                })
                                .catch(err => console.log(err))
                        })
                        .catch(err => console.log(err))
                } else {
                    stocks.updateByProductAndStorage(productId, movementData.targetStorage.id, newTargetStock, movementData.targetStorage.critical_stock)
                        .then(res => {
                            stocks.updateByProductAndStorage(productId, movementData.originStorage.id, newOriginStock, movementData.originStorage.critical_stock)
                                .then(res => {
                                    setMovementData(movementDataDefault())
                                    setUpdateComponent(!updateComponent)
                                    dispatch({ type: 'OPEN_SNACK', value: { type: 'success', message: 'Movimiento realizado' } })
                                })
                                .catch(err => console.log(err))
                        })
                        .catch(err => console.log(err))
                }
            })
            .catch(err => console.log(err))
    }



    return (
        <>
            <AppPaper title={'Movimiento de stock'}>
                <form onSubmit={(e) => { e.preventDefault(); movement() }}>
                    <Grid container spacing={1} padding={1}>
                        <Grid item xs={6}>
                            <Grid container spacing={1} padding={1} direction={'column'}>
                                <Grid item>
                                    <Autocomplete
                                        inputValue={originStoragesInput}
                                        onInputChange={(e, newInputValue) => {
                                            setOriginStoragesInput(newInputValue)
                                        }}
                                        isOptionEqualToValue={(option, value) => null || option.id === value.id}
                                        value={movementData.originStorage}
                                        onChange={(e, newValue) => {
                                            stocks.findOneByProductAndStorage(productId, newValue.id)
                                                .then(res => {
                                                    if (res === null) {
                                                        dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'No hay stock en el almacén seleccionado' } })
                                                        setMovementData(movementDataDefault())
                                                    } else {
                                                        setMovementData({
                                                            ...movementData,
                                                            originStorage: { id: newValue.id, key: newValue.key, label: newValue.label, stock: res.stock, critical_stock: res.critical_stock },
                                                            max: res.stock
                                                        })
                                                    }
                                                })
                                                .catch(err => console.log(err))

                                        }}
                                        fullWidth
                                        disablePortal
                                        options={originStoragesOptions}
                                        renderInput={(params) => <TextField {...params} label='Almacén de origen' size={'small'} fullWidth required />}
                                    />
                                </Grid>
                                <Grid item>
                                    <TextField
                                        label="Cantidad"
                                        value={movementData.quanty}
                                        onChange={(e) => setMovementData({ ...movementData, quanty: e.target.value })}
                                        inputProps={{
                                            max: movementData.max,
                                            min: 1
                                        }}
                                        type="number"
                                        variant="outlined"
                                        size={'small'}
                                        required
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={6}>
                            <Grid container spacing={1} padding={1} direction={'column'}>
                                <Grid item>
                                    <Autocomplete
                                        inputValue={targetStoragesInput}
                                        onInputChange={(e, newInputValue) => {
                                            setTargetStoragesInput(newInputValue)
                                        }}
                                        isOptionEqualToValue={(option, value) => null || option.id === value.id}
                                        value={movementData.targetStorage}
                                        onChange={(e, newValue) => {
                                            stocks.findOneByProductAndStorage(productId, newValue.id)
                                                .then(res => {
                                                    if (res == null) {
                                                        setMovementData({ ...movementData, targetStorage: newValue })
                                                    } else {
                                                        setMovementData({
                                                            ...movementData,
                                                            targetStorage: { id: newValue.id, key: newValue.key, label: newValue.label, stock: res.stock, critical_stock: res.critical_stock }
                                                        })

                                                    }
                                                })
                                                .catch(err => console.log(err))

                                        }}
                                        fullWidth
                                        disablePortal
                                        options={targetStoragesOptions}
                                        renderInput={(params) => <TextField {...params} label='Almacén de destino' size={'small'} fullWidth required />}
                                    />
                                </Grid>
                                <Grid item textAlign={'right'}>
                                    <Button variant={'contained'} type='submit'> Mover</Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </form>
            </AppPaper>
        </>
    )
}

function movementDataDefault() {
    return {
        originStorage: { id: 0, label: '', key: 0, stock: 0, critical_stock: 0 },
        targetStorage: { id: 0, label: '', key: 0, stock: 0, critical_stock: 0 },
        quanty: 0,
        max: 0,
    }
}