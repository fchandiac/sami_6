import { Grid, TextField } from '@mui/material'
import React from 'react'

const utils = require('../../../utils')

export default function ProviderForm(props) {
    const { dialog, edit, closeDialog, afterSubmit, providerData, setProviderData, gridApiRef } = props
    return (
        <>
            <Grid container spacing={1} direction={'column'}>
                <Grid item>
                    <TextField
                        fullWidth
                        label="Rut"
                        variant="outlined"
                        value={providerData.rut}
                        onChange={(e) => setProviderData({ ...providerData, rut: utils.formatRut(e.target.value) })}
                        size={'small'}
                        required
                    />
                </Grid>
                <Grid item>
                    <TextField label="Nombre / Razón Social"
                        value={providerData.name}
                        onChange={(e) => { setProviderData({ ...providerData, name: e.target.value }) }}
                        variant="outlined"
                        size={'small'}
                        fullWidth
                        required
                    />
                </Grid>
                <Grid item>
                    <TextField label="Dirección"
                        value={providerData.address}
                        onChange={(e) => { setProviderData({ ...providerData, address: e.target.value }) }}
                        variant="outlined"
                        size={'small'}
                        fullWidth
                        required
                    />
                </Grid>
            </Grid>
        </>
    )
}
