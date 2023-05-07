import React from 'react'
import { Grid, Typography } from '@mui/material'
import AppPaper from '../AppPaper/AppPaper'
export default function Movements() {
  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={3}>
          <Grid container spacing={1} direction={'column'}>
            <Grid item>
              <AppPaper title={'Balance de Caja'}>
                <Typography variant={'h4'} sx={{ padding: 1 }}>
                  $ 0.00
                </Typography>
              </AppPaper>
            </Grid>
            <Grid item>
              <AppPaper title={'Ingreso de dinero'}>

              </AppPaper>
            </Grid>
            <Grid item>
              <AppPaper title={'Egreso de dinero'}>

              </AppPaper>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={9}>

        </Grid>
      </Grid>
    </>
  )
}
