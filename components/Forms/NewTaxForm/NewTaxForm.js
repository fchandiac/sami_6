import React, { useState } from 'react'
import AppPaper from '../../AppPaper/AppPaper'
import { Grid, TextField, Button } from '@mui/material'

export default function NewTaxForm() {
    const [taxData, setTaxData] = useState(taxDataDefault())

    const saveTax = () => {

    }

    return (
        <>
            <AppPaper title="Nuevo impuesto">
                <form onSubmit={(e) => { e.preventDefault(); saveTax() }}>
                    <Grid container sx={{ p: 1 }} spacing={1} direction={'column'}>
                        <Grid item>
                            <TextField
                                label="Nombre"
                                value={taxData.name}
                                onChange={(e) => { setTaxData({ ...taxData, name: e.target.value }) }}
                                variant="outlined"
                                size={'small'}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item>
                            <TextField
                                label='Valor'
                                value={taxData.value}
                                onChange={(e) => { setTaxData({ ...taxData, value: e.target.value }) }}
                                variant="outlined"
                                type={'number'}
                                inputProps={{ step: "0.01", inputProps: { min: 0 } }}
                                size={'small'}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item textAlign={'right'}>
                            <Button variant="contained" type="submit">Guardar</Button>
                        </Grid>
                    </Grid>
                </form>
            </AppPaper>
        </>
    )
}

function taxDataDefault() {
    return {
        name: '',
        value: ''
    }
}
