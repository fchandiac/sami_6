import React, {useState} from 'react'
import { Grid, Autocomplete, TextField, Button, IconButton, Stack } from '@mui/material'
import StocksGrid from '../Grids/StocksGrid/StocksGrid'

export default function Stocks() {
  const [updateGrid, setUpdateGrid] = useState(false)
  return (
    <>
     <Grid container spacing={1}>
                <Grid item xs={3}>
                   test
                </Grid>
                <Grid item xs={9}>
                    <StocksGrid updateGrid={updateGrid} />
                </Grid>
            </Grid>

    </>
  )
}
