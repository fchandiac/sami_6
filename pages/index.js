import { Box, Dialog, DialogActions, DialogTitle, DialogContent, Grid, TextField, Button } from '@mui/material'
import React from 'react'
import { useRouter } from 'next/router'

export default function index() {

  const router = useRouter()

  const login = () => {
    router.push('/cashRegister')
  }

  return (
    <>
      <Dialog open={true} maxWidth={'xs'} fullWidth>
        <DialogTitle sx={{ p: 2 }}>
          Acceso
        </DialogTitle>
        <form onSubmit={(e) => { e.preventDefault(); login() }}>
          <DialogContent sx={{ p: 2 }}>
            <Grid container spacing={1} direction={'column'}>
              <Grid item marginTop={1}>
                <TextField
                  label="Usuario"
                  // value={rowData.id}
                  inputProps={{ readOnly: true }}
                  variant="outlined"
                  size={'small'}
                  fullWidth
                />
              </Grid>
              <Grid item>
                <TextField
                  label="Contraseña"
                  // value={rowData.name}
                  inputProps={{ readOnly: true }}
                  variant="outlined"
                  size={'small'}
                  fullWidth
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
