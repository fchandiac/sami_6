import { Grid } from '@mui/material'
import React, { useState } from 'react'
import NewTaxForm from '../Forms/NewTaxForm/NewTaxForm'

export default function Taxes() {
    return (
        <Grid container spacing={1}>
            <Grid item xs={3}>
                <NewTaxForm />
            </Grid>
            <Grid item xs={9}>
                grid
            </Grid>
        </Grid>
    )
}
