import React from 'react'
import AppPaper from '../../AppPaper'
import { Button, Grid, TextField } from '@mui/material'

export default function NewCategoryForm() {
    const submit = (e) => {
        e.preventDefault()
        alert('juanito')
    }
  return (
    <AppPaper title='Nueva Categoría'>
    <form onSubmit={submit}>
        <Grid container sx={{ p: 1 }}>
            <Grid item xs={12} sm={12} md={12}>
                <TextField label="Nombre"
                    name="name"
                    //error ={teenData.name.length === 0 ? true : false }
                    //error={validation.name.err}
                    //value={teenData.name}
                    //onChange={handleOnChange}
                    variant="outlined"
                    size={'small'}
                    //onFocus={handleFocus}
                    //helperText={validation.name.text}
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
