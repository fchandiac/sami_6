import React, { useState, useEffect } from 'react'
import { Grid, TextField, Button, FormControlLabel, Switch } from '@mui/material'
import AppPaper from '../../AppPaper/AppPaper'



const profiles = require('../../../promises/profiles')


export default function Profiles() {
    const [profileData, setProfileData] = useState(profileDataDefault())

    const saveProfile = () => { 
        console.log(profileData)
    }

    return (
        <>
            <Grid container spacing={1}>
                <Grid item xs={3}>
                    <form onSubmit={(e) => { e.preventDefault(); saveProfile() }}>
                        <AppPaper title="Nuevo usuario">
                            <Grid container spacing={1} direction={'column'} p={1}>
                                <Grid item >
                                    <TextField
                                        label='Nombre perfil'
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        size='small'
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item >
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={profileData.products}
                                                onChange={(e) => setProfileData({ ...profileData, products: e.target.checked })}
                                            />
                                        }
                                        label="Productos"
                                    />
                                </Grid>
                                <Grid item >
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={profileData.accounting}
                                                onChange={(e) => setProfileData({ ...profileData, accounting: e.target.checked })}
                                            />
                                        }
                                        label="Contabilidad"
                                    />
                                </Grid>
                                <Grid item>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={profileData.users}
                                                onChange={(e) => setProfileData({ ...profileData, users: e.target.checked })}
                                            />
                                        }
                                        label="Usuarios"
                                    />
                                </Grid>
                                <Grid item>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={profileData.config}
                                                onChange={(e) => setProfileData({ ...profileData, config: e.target.checked })}
                                            />
                                        }
                                        label='Configuración'
                                    />
                                </Grid>
                                <Grid item textAlign={'right'}>
                                    <Button type='submit' variant='contained' color='primary'>Guardar</Button>
                                </Grid>
                            </Grid>
                        </AppPaper>
                    </form>
                </Grid>
                <Grid item xs={9}>

                </Grid>
            </Grid>
        </>
    )
}


function profileDataDefault() {
    return ({
        name: '',
        un_lock: false,
        config: false,
        products: false,
        users: false,
        accounting: false,
    })
}