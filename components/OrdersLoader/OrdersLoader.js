import React, {useRef, useEffect, useState} from 'react'
import AppPaper from '../AppPaper/AppPaper'
import { Grid, IconButton, TextField } from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'


export default function OrdersLoader(props) {
    const {inputOrderRef} = props
    const  [orderId, setOrderId] = useState(null)
    const addOrder = () => {
       
    }

    

  return (
    <>
         <form onSubmit={(e) => { e.preventDefault(); addOrder() }}>
                <AppPaper title='Cargar pedido'>
                    <Grid container spacing={1} padding={1}>
                        <Grid item xs>
                            <TextField
                                inputRef={inputOrderRef}
                                label="pedido"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                variant="outlined"
                                size={'small'}
                                fullWidth
                            />
                        </Grid>
                        <Grid item alignSelf={'flex-end'}>
                            <IconButton type='submit'>
                                <ShoppingCartIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                </AppPaper>
            </form>

    </>
  )
}
