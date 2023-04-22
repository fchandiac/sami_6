import { Button, Grid } from '@mui/material'
import React, { useState, useEffect } from 'react'
import AppPaper from '../AppPaper/AppPaper'

const products = require('../../promises/products')

export default function Favorites() {
    const [favorites, setFavorites] = useState([])

    useEffect(() => {
        products.findAll().then(res => {
            let data = res.filter(product => product.favorite == true)
            setFavorites(data)
            console.log(res)
        }).catch(err => {
            console.log(err)
        })
    }, [])



    return (
        <>
            <AppPaper title={'Productos favoritos'}>
            <Grid container spacing={1} padding={1}>
                {favorites.map((product) => (
                    <Grid item key={product.id}>
                        <Button variant={'outlined'}>{product.name}</Button>
                    </Grid>
                ))}
            </Grid>
            </AppPaper>
        </>
    )
}
