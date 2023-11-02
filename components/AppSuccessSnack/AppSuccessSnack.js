import { Snackbar, Alert } from '@mui/material'
import React from 'react'

export default function AppSuccessSnack(props) {
  
    const {openSnack, setOpenSnack, text} = props

    const handleCloseSnack = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnack(false)
    }

    return (
        <Snackbar open={openSnack} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} autoHideDuration={4000} onClose={handleCloseSnack}>
            <Alert severity={'success'} variant={'filled'}>
                {text}
            </Alert>
        </Snackbar>
    )
}
