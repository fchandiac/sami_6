import React, { useState, useEffect } from 'react'
import { Box, Dialog, DialogActions, DialogTitle, DialogContent, Grid, TextField, Button } from '@mui/material'
import { useRouter } from 'next/router'
import { useAppContext } from '../AppProvider'

const users = require('../promises/users')


export default function index() {
  const router = useRouter()
  const { user, dispatch } = useAppContext()
  const [userData, setUserData] = useState(userDataDefault())

  const login = () => {
    users.login(userData.user, userData.name)
    .then(res => {
      console.log(res)
      if (res == 'Usuario no existe'){
        dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: res } })
      } else if (res == 'Contraseña incorrecta'){
        dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: res } })
      } else {
        let user = { 
          id: res.id, 
          user: res.user, 
          pass: res.pass,
          name: res.name, 
          profileId: res.profileId, 
          profile: res.Profile.name, 
          permissions: [] 
        }
        dispatch({ type: 'SET_USER', value: user })
        router.push('/cashRegister')
      }
    })
    .catch(err => {
      console.log(err)
    })
    //router.push('/cashRegister')
  }

  return (
    <>
      {/* <Box sx={{ height: '25vh', width: '28vw', mt:35, ml:70, mr:30,  backgroundColor: 'primary.main' }} /> */}

      <Dialog open={true} maxWidth={'xs'} fullWidth
        BackdropProps={{
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.1)' },
        }}
      // PaperProps={{
      //   sx: { boxShadow: '0px 20px 300px rgba(0, 0, 0, 0.6)' },
      // }}
      >
        <DialogTitle sx={{ p: 2 }}>
          Acceso
        </DialogTitle>
        <form onSubmit={(e) => { e.preventDefault(); login() }}>
          <DialogContent sx={{ p: 2 }}>
            <Grid container spacing={1} direction={'column'}>
              <Grid item marginTop={1}>
                <TextField
                  label="Usuario"
                  value={userData.user}
                  onChange={(e) => setUserData({ ...userData, user: e.target.value })}
                  variant="outlined"
                  size={'small'}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item>
                <TextField
                  label="Contraseña"
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  variant="outlined"
                  type='password'
                  size={'small'}
                  fullWidth
                  required
                />
              </Grid>

            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button variant={'contained'} type={'submit'}>ingresar</Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}

function userDataDefault() {
  return {
    user: '',
    name: ''
  }
}