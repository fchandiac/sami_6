import { Grid } from '@mui/material'
import React, {useState} from 'react'
import NewCategoryForm from '../Forms/NewCategoryForm'
import CategoriesGrid from '../Grids/CategoriesGrid/CategoriesGrid'

export default function Categories() {
  const [updateGrid, setUpdateGrid] = useState(false)
  return (
    <Grid container spacing={1}>
      <Grid item xs={3}>
        <NewCategoryForm setUpdateGrid={setUpdateGrid} updateGrid={updateGrid}/>
      </Grid>
      <Grid item xs={9}>
        <CategoriesGrid update={updateGrid}/>
      </Grid>


    </Grid>
  )
}
