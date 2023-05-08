import React, { useEffect } from 'react'
import { Grid, Stack, Typography, TextField } from '@mui/material'
import AppPaper from '../AppPaper/AppPaper'
import { useAppContext } from '../../AppProvider'
import { useTheme } from '@mui/material/styles'

import electron from 'electron'
const ipcRenderer = electron.ipcRenderer || false

const utils = require('../../utils')


export default function Movements() {
  const { movements, dispatch } = useAppContext()
  const theme = useTheme()
  const [newMovement, setNewMovement] = React.useState(NewMovementDefault())



  useEffect(() => {
    let movements = ipcRenderer.sendSync('get-movements', 'sync')
    dispatch({ type: 'SET_MOVEMENTS', value: movements })
    console.log(movements)
  }, [])

  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={3}>
          <Grid container spacing={1} direction={'column'}>
            <Grid item>
              <AppPaper title={'Balance de Caja'}>
                <Stack justifyContent={'space-between'} direction={'row'}>
                  <Typography variant={'h4'} sx={{ padding: 1 }}>
                    {utils.renderMoneystr(movements.balance)}
                  </Typography>
                  <Typography variant={'caption'} sx={{ padding: 1 }} color={movements.state ? theme.palette.success.main : theme.palette.error.main}>
                    {movements.state ? 'Caja abierta' : 'Carja cerrada'}
                  </Typography>
                </Stack>
              </AppPaper>
            </Grid>
            <Grid item>
              <AppPaper title={'Ingreso de dinero'}>
                <Grid container spacing={1} direction={'column'} p={1}>
                  <Grid item>
                    <TextField
                      label={'Monto'}
                      value={utils.renderMoneystr(newMovement.amount)}
                      onChange={(e) => { e.target.value === '$ ' || e.target.value === '$' || e.target.value === '0' || e.target.value === '' ? setNewMovement({ ...newMovement, amount: 0 }) : setNewMovement({ ...newMovement, amount: utils.moneyToInt(e.target.value) }) }}
                      variant="outlined"
                      size={'small'}
                      fullWidth
                      required
                    />
                  </Grid>
                </Grid>


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


function NewMovementDefault() {
  return ({
    amount: 0,
    type: 0,
    balance: 0,
    date: new Date()
  })
}