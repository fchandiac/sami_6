import { Grid } from '@mui/material'
import React, { useState } from 'react'
import NewProductForm from '../Forms/NewProductForm'
import ProductsGrid from '../Grids/ProductsGrid/ProductsGrid'

export default function Products() {
    const [productsGridState, setProductsGridState] = useState(false)

    const updateProductsGridState = () => {
        let gridState = productsGridState == false ? true : false
        setProductsGridState(gridState)
    }

    return (
        <Grid container spacing={1}>
            <Grid item xs={2}>
                <NewProductForm updateGrid={updateProductsGridState} />
            </Grid>
            <Grid item xs={10}>
                <ProductsGrid update={productsGridState} />
            </Grid>
        </Grid>
    )
}
