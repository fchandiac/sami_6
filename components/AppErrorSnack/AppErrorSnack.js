import { Snackbar, Alert } from '@mui/material'
import React from 'react'

export default function AppErrorSnack(props) {
    const {openSnack, setOpenSnack, errorText} = props

    const handleCloseSnack = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnack(false)
    }

    return (
        <Snackbar open={openSnack} sx={{marginTop: 5}} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} autoHideDuration={4000} onClose={handleCloseSnack}>
            <Alert severity="error" variant={'filled'}>
                {errorText}
            </Alert>

        </Snackbar>
    )
}
