import React, { useState } from 'react'
import AppPaper from '../../AppPaper'
import { useAppContext } from '../../../AppProvider'
import { Button, Grid, TextField } from '@mui/material'

const categories = require('../../../promises/categories')

export default function NewCategoryForm(props) {
    const { updateGrid, setUpdateGrid } = props
    const { dispatch } = useAppContext()
    const [categoryName, setCategoryName] = useState('')

    const submit = (e) => {
        e.preventDefault()
        categories.create(categoryName)
            .then(() => { 
                setUpdateGrid(!updateGrid)
            })
            .catch((err) => {
                console.log(err)
                if (err.errors[0].message === 'name must be unique') {
                    dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'El nombre de la categoría ya existe' } })
                }
             })

    }
    return (
        <AppPaper title='Nueva Categoría'>
            <form onSubmit={submit}>
                <Grid container sx={{ p: 1 }}>
                    <Grid item xs={12} sm={12} md={12}>
                        <TextField label="Nombre"
                            name="name"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            variant="outlined"
                            size={'small'}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} paddingTop={1} textAlign='right'>
                        <Button variant={'contained'} type='submit'>guardar</Button>
                    </Grid>
                </Grid>
            </form>
        </AppPaper>
    )
}
