import React from 'react'
import AppPaper from '../../AppPaper/AppPaper'
import { Grid } from '@mui/material'

export default function Movement() {
    return (
        <>
            <AppPaper title={'Movimiento de stock'}>
                <Grid container spacing={1} padding={1}>
                    <Grid item xs={12}>
                        test
                    </Grid>
                </Grid>
            </AppPaper>
        </>
    )
}
