import React, {useState} from 'react'
import { Grid, Autocomplete, TextField, Button, IconButton, Stack } from '@mui/material'
import StocksGrid from '../Grids/StocksGrid/StocksGrid'
import StoragesGrid from '../Grids/StoragesGrid/StoragesGrid'

export default function Stocks() {
  const [updateGrid, setUpdateGrid] = useState(false)
  return (
    <>
     <Grid container spacing={1}>
                <Grid item xs={4}>
                   <StoragesGrid />
                </Grid>
                <Grid item xs={8}>
                    <StocksGrid updateGrid={updateGrid} />
                </Grid>
            </Grid>

    </>
  )
}
