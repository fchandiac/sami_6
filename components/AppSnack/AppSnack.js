import { Snackbar, Alert } from '@mui/material'
import React from 'react'
import { useAppContext } from '../../AppProvider'

export default function AppSnack() {
    const {snackState, snackType, snackMessage, dispatch} = useAppContext()

    const handleCloseSnack = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        dispatch({type: 'CLOSE_SNACK'})
    }

    return (
        <Snackbar open={snackState} sx={{marginTop: 5}} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} autoHideDuration={4000} onClose={handleCloseSnack}>
            <Alert severity={snackType} variant={'filled'}>
                {snackMessage}
            </Alert>

        </Snackbar>
    )
}
