import React, { useEffect, useState } from 'react'
import {
  Grid, Stack, Typography, TextField, Chip, Button, Autocomplete, Box,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText
} from '@mui/material'
import AppPaper from '../AppPaper/AppPaper'
import { useAppContext } from '../../AppProvider'
import { useTheme } from '@mui/material/styles'

import electron from 'electron'
import MovementsGrid from '../Grids/MovementsGrid.js/MovementsGrid'
const ipcRenderer = electron.ipcRenderer || false

const utils = require('../../utils')


export default function Movements() {
  const { movements, dispatch, lock, user } = useAppContext()
  const theme = useTheme()
  const [newMovementData, setNewMovementData] = React.useState(newMovementDataDefault())
  const [movementsInput, setMovementsInput] = useState('')
  const [movementsOptions, setMovementsOptions] = useState([{ id: 1002, key: 1002, label: 'Ingreso' }, { id: 1003, key: 1003, label: 'Egreso' }])
  const [displayOpenForm, setDisplayOpenForm] = useState(false)
  const [openCloseDialog, setOpenCloseDialog] = useState(false)
  const [closeData, setCloseData] = useState(closeDataDefault())





  const renderOpenCloseButton = () => {
    if (movements.state == true) {
      return (
        <Chip
          label={'Cerrar caja'}
          onClick={() => { closeCashRegisterButton() }}
        />)
    } else {
      return (
        <Chip
          label={'Abrir caja'}
          onClick={() => { openCashRegisterButton() }}
        />)
    }
  }

  const closeCalc = () => {
    let movs = movements.movements
    let incomes = movs.filter(item => item.type == 1002)
    let incomesTotal = incomes.reduce((a, b) => a + b.amount, 0)
    let outcomes = movs.filter(item => item.type == 1003)
    let outcomesTotal = outcomes.reduce((a, b) => a + b.amount, 0)
    let creditNotes = movs.filter(item => item.type == 1005)
    let creditNotesTotal = creditNotes.reduce((a, b) => a + b.amount, 0)
    let deleteSales = movs.filter(item => item.type == 1007)
    let deleteSalesTotal = deleteSales.reduce((a, b) => a + b.amount, 0)
    let sales = movs.filter(item => item.type == 1004)
    let salesTotal = sales.reduce((a, b) => a + b.amount, 0)

    let openAmount = movs.filter(item => item.type == 1001)[0].amount


    setCloseData({
      incomes: incomesTotal,
      outcomes: outcomesTotal,
      creditNotes: creditNotesTotal,
      deleteSales: deleteSalesTotal,
      sales: salesTotal,
      openAmount: openAmount,
      balance: movements.balance
    })
  }

  const openCashRegisterButton = () => {

    setDisplayOpenForm(true)
    // if (lock == false) {
    //   setDisplayOpenForm(true)
    // } else {
    //   dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'Caja bloqueada, solicita desbloqueo al administrador' } })
    // }
  }

  const closeCashRegisterButton = () => {
    closeCalc()
    setOpenCloseDialog(true)

  }

  const closeCashRegister = () => {
    let newMov = {
      state: false,
      balance: 0,
      movements: []
    }
    ipcRenderer.send('update-movements', newMov)
    dispatch({ type: 'SET_MOVEMENTS', value: newMov })
    setOpenCloseDialog(false)
  }

  const openCashRegister = () => {
    let newMov = {
      state: true,
      balance: newMovementData.openAmount,
      movements: [
        {
          sale_id: 0,
          user: user.name,
          type: 1001,
          amount: newMovementData.openAmount,
          payment_method: '-',
          balance: newMovementData.openAmount,
          dte_code: 0,
          dte_number: 0,
          date: new Date()
        }
      ]
    }
    ipcRenderer.send('update-movements', newMov)
    dispatch({ type: 'SET_MOVEMENTS', value: newMov })
    setDisplayOpenForm(false)
  }

  const newMovement = () => {
    switch (newMovementData.type.id) {
      case 1002:
        let movs = movements.movements
        movs.push({
          sale_id: 0,
          user: user.name,
          type: 1002,
          amount: newMovementData.amount,
          payment_method: '-',
          balance: movements.balance + newMovementData.amount,
          dte_code: 0,
          dte_number: 0,
          date: new Date()
        })
        let newMov = {
          state: true,
          balance: movements.balance + newMovementData.amount,
          movements: movs
        }
        ipcRenderer.send('update-movements', newMov)
        dispatch({ type: 'SET_MOVEMENTS', value: newMov })
        setNewMovementData(newMovementDataDefault())
        break
      case 1003:
        let movs2 = movements.movements
        movs2.push({
          sale_id: 0,
          user: user.name,
          type: 1003,
          amount: newMovementData.amount * -1,
          payment_method: '-',
          balance: movements.balance - newMovementData.amount,
          dte_code: 0,
          dte_number: 0,
          date: new Date()
        })
        let newMov2 = {
          state: true,
          balance: movements.balance - newMovementData.amount,
          movements: movs2
        }
        ipcRenderer.send('update-movements', newMov)
        dispatch({ type: 'SET_MOVEMENTS', value: newMov2 })
        setNewMovementData(newMovementDataDefault())
        break
      default:
        console.log('default')
        break
    }
  }



  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={2}>
          <Grid container spacing={1} direction={'column'}>
            <Grid item>
              <AppPaper title={'Balance de Caja'}>
                <Typography variant={'h4'} sx={{ padding: 1 }} textAlign={'center'}>
                  {utils.renderMoneystr(movements.balance)}
                </Typography>
                <Stack justifyContent={'center'} direction={'row'} p={1} alignItems={'center'}>
                  <Typography variant={'caption'} sx={{ padding: 1 }} color={movements.state ? theme.palette.success.main : theme.palette.error.main}>
                    {movements.state ? 'Caja abierta' : 'Caja cerrada'}
                  </Typography>
                  {renderOpenCloseButton()}
                </Stack>

                <Box sx={{ display: displayOpenForm ? 'block' : 'none', p: 1 }}>
                  <AppPaper title={'Apertura de caja'}>
                    <form onSubmit={(e) => { e.preventDefault(); openCashRegister() }}>
                      <Grid container spacing={1} direction={'column'} p={1}>
                        <Grid item>
                          <TextField
                            label={'Monto'}
                            value={utils.renderMoneystr(newMovementData.openAmount)}
                            onChange={(e) => { e.target.value === '$ ' || e.target.value === '$' || e.target.value === '0' || e.target.value === '' ? setNewMovementData({ ...newMovementData, openAmount: 0 }) : setNewMovementData({ ...newMovementData, openAmount: utils.moneyToInt(e.target.value) }) }}
                            variant="outlined"
                            size={'small'}
                            fullWidth
                            autoFocus
                            required
                          />
                        </Grid>
                        <Grid item textAlign={'right'}>
                          <Button variant={'contained'} type='submit'>Abrir caja</Button>
                        </Grid>
                      </Grid>
                    </form>
                  </AppPaper>
                </Box>


              </AppPaper>
            </Grid>
            <Grid item sx={{ display: lock ? 'none' : 'block' }}>
              <AppPaper title={'Nuevo movimiento'}>
                <form onSubmit={(e) => { e.preventDefault(); newMovement() }}>
                  <Grid container spacing={1} direction={'column'} p={1}>
                    <Grid item>
                      <Autocomplete
                        inputValue={movementsInput}
                        onInputChange={(e, newInputValue) => {
                          setMovementsInput(newInputValue)
                        }}
                        isOptionEqualToValue={(option, value) => null || option.id === value.id}
                        value={newMovementData.type}
                        onChange={(e, newValue) => {
                          setNewMovementData({ ...newMovementData, type: newValue })
                        }}
                        disablePortal
                        options={movementsOptions}
                        renderInput={(params) => <TextField {...params} label='Tipo' size={'small'} fullWidth required />}
                      />
                    </Grid>
                    <Grid item>
                      <TextField
                        label={'Monto'}
                        value={utils.renderMoneystr(newMovementData.amount)}
                        onChange={(e) => { e.target.value === '$ ' || e.target.value === '$' || e.target.value === '0' || e.target.value === '' ? setNewMovementData({ ...newMovementData, amount: 0 }) : setNewMovementData({ ...newMovementData, amount: utils.moneyToInt(e.target.value) }) }}
                        variant="outlined"
                        size={'small'}
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item textAlign={'right'}>
                      <Button variant={'contained'} type='submit'>Guardar</Button>
                    </Grid>
                  </Grid>
                </form>
              </AppPaper>
            </Grid>
            <Grid item>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={10}>
          <MovementsGrid />
        </Grid>
      </Grid>

      <Dialog open={openCloseDialog} maxWidth={'xs'} fullWidth>
        <DialogTitle sx={{ p: 2 }}>
          Cierre de Caja
        </DialogTitle>
        <form onSubmit={(e) => { e.preventDefault(); closeCashRegister() }}>
          <DialogContent sx={{ p: 2 }}>
            <Grid container spacing={1} direction={'column'}>
              <Grid item>
                <TextField
                  label="Apertura"
                  value={utils.renderMoneystr(closeData.openAmount)}
                  inputProps={{ readOnly: true }}
                  variant="outlined"
                  size={'small'}
                  fullWidth
                />
              </Grid>
              <Grid item>
                <TextField
                  label="Ventas"
                  value={utils.renderMoneystr(closeData.sales)}
                  inputProps={{ readOnly: true }}
                  variant="outlined"
                  size={'small'}
                  fullWidth
                />
              </Grid>
              <Grid item>
                <TextField
                  label="Ventas eliminadas"
                  value={utils.renderMoneystr(closeData.deleteSales)}
                  inputProps={{ readOnly: true }}
                  variant="outlined"
                  size={'small'}
                  fullWidth
                />
              </Grid>
              <Grid item>
                <TextField
                  label="Notas de Credito"
                  value={utils.renderMoneystr(closeData.creditNotes)}
                  inputProps={{ readOnly: true }}
                  variant="outlined"
                  size={'small'}
                  fullWidth
                />
              </Grid>
              <Grid item>
                <TextField
                  label="ingresos"
                  value={utils.renderMoneystr(closeData.incomes)}
                  inputProps={{ readOnly: true }}
                  variant="outlined"
                  size={'small'}
                  fullWidth
                />
              </Grid>
              <Grid item>
                <TextField
                  label="Egresos"
                  value={utils.renderMoneystr(closeData.outcomes)}
                  inputProps={{ readOnly: true }}
                  variant="outlined"
                  size={'small'}
                  fullWidth
                />
              </Grid>
              <Grid item textAlign={'right'}>
                <Typography variant={'h6'}> Balance al cierre de caja: {utils.renderMoneystr(closeData.balance)}</Typography>
              </Grid>

            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button variant={'contained'} type={'submit'}>Cierre de Caja</Button>
            <Button variant={'outlined'} onClick={() => setOpenCloseDialog(false)}>Cerrar</Button>
          </DialogActions>
        </form >
      </Dialog >



    </>
  )
}


function newMovementDataDefault() {
  return ({
    amount: 0,
    type: { id: 0, key: 0, label: '' },
    balance: 0,
    dte_code: 0,
    dte_number: 0,
    date: new Date(),
    openAmount: 0,
  })
}

function closeDataDefault() {
  return ({
    balance: 0,
    openAmount: 0,
    sales: 0,
    deleteSales: 0,
    incomes: 0,
    outcomes: 0,
    creditNotes: 0,
    notes: ''
  })
}