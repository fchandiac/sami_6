import React from 'react'
import { Button, Grid, TextField } from '@mui/material'
import AppPaper from '../components/AppPaper'
import { useAppContext } from '../AppProvider'

export default function myAccount() {
  const { user } = useAppContext()

  const changePass = () => {
    console.log('changePass')
  }
  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={3} sm={3}>
          <AppPaper title="Datos de usuario">
            <Grid container spacing={1} direction={'column'} p={1}>
              <Grid item>
                <TextField
                  label="Funcionario"
                  value={user.name}
                  variant="outlined"
                  size={'small'}
                  imputProps={{ readOnly: true }}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item>
                <TextField
                  label="Usuario"
                  value={user.user}
                  variant="outlined"
                  size={'small'}
                  imputProps={{ readOnly: true }}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item>
                <TextField
                  label="Pérfil"
                  value={user.profile}
                  variant="outlined"
                  size={'small'}
                  imputProps={{ readOnly: true }}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
          </AppPaper>
        </Grid>
        <Grid item xs={3} sm={3}>
          <form onSubmit={(e) => {e.preventDefault(); changePass()}}>
          <AppPaper title="Cambiar contraseña">
            <Grid container spacing={1} direction={'column'} p={1}>
              <Grid item>
                <TextField
                  label="Antigua contraseña"
                  value={''}
                  type='password'
                  variant="outlined"
                  size={'small'}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item>
                <TextField
                  label="Nueva contraseña"
                  value={''}
                  type='password'
                  variant="outlined"
                  size={'small'}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item>
                <TextField
                  label="Confirmar contraseña"
                  value={''}
                  type='password'
                  variant="outlined"
                  size={'small'}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item textAlign={'right'}>
                <Button variant="contained" color="primary" type='submit'>
                  Cambiar
                </Button>
              </Grid>
            </Grid>
          </AppPaper>
          </form>
        </Grid>
      </Grid>
    </>
  )
}
