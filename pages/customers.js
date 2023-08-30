import React, { useEffect, useState } from 'react'
import { Button, Grid, TextField, Autocomplete, Switch, FormControlLabel } from '@mui/material'
import NewCustomerForm from '../components/Forms/NewCustomerForm'
import CustomersGrid from '../components/Grids/CustomersGrid'
import CustomersTab from '../components/Tabs/CustomersTab'


export default function customers() {

  

  return (
    <>
    <CustomersTab Customers={Customers()}/>
    </>
  )
}




function Customers() {
  const [customersGridState, setCustomersGridState] = useState(false)

  const updateCustomersGridState = () => {
    let gridState = customersGridState == false ? true : false
    setCustomersGridState(gridState)
  }

  return (
    <>
     <Grid container spacing={1}>
        <Grid item xs={3}>
          <NewCustomerForm updateCustomersGridState={updateCustomersGridState} />
        </Grid>
        <Grid item xs={9}>
          <CustomersGrid update={customersGridState} />
        </Grid>
      </Grid>
    </>
  )
}
