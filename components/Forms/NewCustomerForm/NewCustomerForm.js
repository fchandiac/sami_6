import React, { useState, useEffect } from 'react'
import AppPaper from '../../AppPaper'
import { useAppContext } from '../../../AppProvider'
import { Button, Grid, TextField, Autocomplete } from '@mui/material'
import electron from 'electron'
const ipcRenderer = electron.ipcRenderer || false

const utils = require('../../../utils')
const lioren = require('../../../promises/lioren')
const customers = require('../../../promises/customers')

export default function NewCategoryForm(props) {
    const { updateCustomersGridState} = props
    const { dispatch } = useAppContext()
    const [customerData, setCustomerData] = useState(customerDataDefault())
    const [comunasOptions, setComunasOptions] = useState([])
    const [comunasInput, setComunasInput] = useState('')
    const [ciudadesOptions, setCiudadesOptions] = useState([])
    const [ciudadesInput, setCiudadesInput] = useState('')

    useEffect(() => {
        let token = ipcRenderer.sendSync('get-lioren', 'sync').token
        lioren.comunas(token)
            .then(res => {
                let data = res.map((item) => ({
                    label: item.nombre,
                    id: item.id,
                    key: item.id,
                    region_id: item.region_id,
                }))
                setComunasOptions(data)
            })
            .catch(err => { console.log(err) })
    }, [])

    useEffect(() => {
        let token = ipcRenderer.sendSync('get-lioren', 'sync').token
        lioren.ciudades(token)
            .then(res => {
                console.log(res)
                let data = res.map((item) => ({
                    label: item.nombre,
                    id: item.id,
                    key: item.id,
                    region_id: item.region_id,
                }))
                data = data.filter((item) => item.region_id === customerData.district.region_id)
                setCiudadesOptions(data)
            })
            .catch(err => { console.log(err) })
    }, [customerData.comuna])


    const submit = (e) => {
        e.preventDefault()
        console.log(customerData)
        customers.create(
            customerData.rut, 
            customerData.name, 
            customerData.activity, 
            customerData.district.id, 
            customerData.city.id, 
            customerData.address)
        .then((res) => {
            updateCustomersGridState()
            setCustomerData(customerDataDefault())
        })
        .catch((err) => { console.error(err) })
        
    }
    return (
        <AppPaper title='Nuevo Cliente'>
            <form onSubmit={submit}>
                <Grid container sx={{ p: 1 }} spacing={1} direction={'column'}>
                    <Grid item>
                        <TextField label="Rut"
                            value={customerData.rut}
                            onChange={(e) => { setCustomerData({ ...customerData, rut: utils.formatRut(e.target.value) }) }}
                            variant="outlined"
                            size={'small'}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item>
                        <TextField label="Nombre / Razón Social"
                            value={customerData.name}
                            onChange={(e) => { setCustomerData({ ...customerData, name: e.target.value }) }}
                            variant="outlined"
                            size={'small'}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item>
                        <TextField label="Giro"
                            value={customerData.activity}
                            onChange={(e) => { setCustomerData({ ...customerData, activity: e.target.value }) }}
                            variant="outlined"
                            size={'small'}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item>
                        <Autocomplete
                            inputValue={comunasInput}
                            onInputChange={(e, newInputValue) => {
                                setComunasInput(newInputValue)
                            }}
                            isOptionEqualToValue={(option, value) => null || option.id === value.id}
                            value={customerData.district}
                            onChange={(e, newValue) => {
                                setCustomerData({ ...customerData, district: newValue })
                                //setCiudadesInput('')
                                // setCustomerData({ ...customerData, ciudad: { key: 0, label: '', id: 0, region_id: 0 } })
                            }}
                            disablePortal
                            options={comunasOptions}
                            renderInput={(params) => <TextField {...params} label='Comuna' size={'small'} fullWidth required />}
                        />
                    </Grid>
                    <Grid item>
                        <Autocomplete
                            inputValue={ciudadesInput}
                            onInputChange={(e, newInputValue) => {
                                setCiudadesInput(newInputValue)
                            }}
                            isOptionEqualToValue={(option, value) => null || option.id === value.id}
                            value={customerData.city}
                            onChange={(e, newValue) => {
                                setCustomerData({ ...customerData, city: newValue })
                            }}
                            disablePortal
                            options={ciudadesOptions}
                            renderInput={(params) => <TextField {...params} label='Ciudad' size={'small'} fullWidth required />}
                        />
                    </Grid>
                    <Grid item>
                        <TextField label="Dirección"
                            value={customerData.address}
                            onChange={(e) => { setCustomerData({ ...customerData, address: e.target.value}) }}
                            variant="outlined"
                            size={'small'}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} paddingTop={1} textAlign='right'>
                        <Button variant={'contained'} type='submit'>guardar</Button>
                    </Grid>
                </Grid>
            </form>
        </AppPaper>
    )
}


function customerDataDefault() {
    return ({
        rut: '',
        name: '',
        activity: '',
        district: { key: 0, id: '', label: '' },
        city: { key: 0, id: '', label: '' },
        address: ''
    })
}

