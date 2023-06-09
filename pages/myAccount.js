import React, { useState } from 'react'
import { Button, Grid, TextField } from '@mui/material'
import AppPaper from '../components/AppPaper'
import { useAppContext } from '../AppProvider'
import { useRouter } from 'next/router'

const users = require('../promises/users')


export default function myAccount() {
  const { user, dispatch } = useAppContext()
  const router = useRouter()
  const [userData, setUserData] = useState({ old_pass: '', new_pass: '', confirm_pass: '' })

  const changePass = () => {

    if (userData.new_pass != userData.confirm_pass) {
      dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'Las contraseñas no coinciden' } })
    } else {
      users.updatePass(user.id, userData.old_pass, userData.new_pass)
        .then(res => {
          if (res == 'Contraseña anterior incorrecta') {
            dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: res } })
          } else {
            dispatch({ type: 'OPEN_SNACK', value: { type: 'success', message: 'Contraseña actualizada' } })
            setUserData({ old_pass: '', new_pass: '', confirm_pass: '' })
            router.push('/')
          }

        })
        .catch(err => { console.log(err) })
    }

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
          <form onSubmit={(e) => { e.preventDefault(); changePass() }}>
            <AppPaper title="Cambiar contraseña">
              <Grid container spacing={1} direction={'column'} p={1}>
                <Grid item>
                  <TextField
                    label="Antigua contraseña"
                    value={userData.old_pass}
                    onChange={(e) => setUserData({ ...userData, old_pass: e.target.value })}
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
                    value={userData.new_pass}
                    onChange={(e) => setUserData({ ...userData, new_pass: e.target.value })}
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
                    value={userData.confirm_pass}
                    onChange={(e) => setUserData({ ...userData, confirm_pass: e.target.value })}
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
