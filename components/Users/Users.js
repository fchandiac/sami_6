import React, { useState, useEffect } from 'react'
import { Grid, TextField, Button, Autocomplete } from '@mui/material'
import AppPaper from '../AppPaper/AppPaper'
import UsersGrid from '../Grids/UsersGrid/UsersGrid'

const profiles = require('../../promises/profiles')
const users = require('../../promises/users')



export default function Users() {
    const [userData, setUserData] = useState(userDataDefault())
    const [profilesOptions, setProfilesOptions] = useState([])
    const [profilesInput, setProfilesInput] = useState('')
    const [usersGridState, setUsersGridState] = useState(false)

    const updateUsersGridState = () => {
        let gridState = usersGridState == false ? true : false
        setUsersGridState(gridState)
    }

    useEffect(() => {
        profiles.findAll().then(res => {
            let data = res.map(item => ({
                id: item.id,
                key: item.id,
                label: item.name
            }))
            setProfilesOptions(data)
        }).catch(err => {
            console.log(err)
        })
    }, [])
    const saveUser = () => {
        users.create(userData.user, userData.name, userData.pass, userData.profile.id)
            .then(() => {
                setUserData(userDataDefault())
                updateUsersGridState()
            })
            .catch(err => {console.error(err)})

    }
    return (
        <>
            <Grid container spacing={1}>
                <Grid item xs={3}>
                    <form onSubmit={(e) => { e.preventDefault(); saveUser() }}>
                        <AppPaper title="Nuevo usuario">
                            <Grid container spacing={1} direction={'column'} p={1}>
                                <Grid item >
                                    <TextField
                                        label='Nombre de usuario'
                                        value={userData.user}
                                        onChange={(e) => setUserData({ ...userData, user: e.target.value })}
                                        size='small'
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item >
                                    <TextField
                                        label='Nombre Funcionario'
                                        value={userData.name}
                                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                                        size='small'
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item >
                                    <TextField
                                        label='Constraseña'
                                        value={userData.pass}
                                        inputProps={{ readOnly: true }}
                                        size='small'
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item>
                                    <Autocomplete
                                        inputValue={profilesInput}
                                        onInputChange={(e, newInputValue) => {
                                            setProfilesInput(newInputValue)
                                        }}
                                        isOptionEqualToValue={(option, value) => null || option.id === value.id}
                                        value={userData.profile}
                                        onChange={(e, newValue) => {
                                            setUserData({ ...userData, profile: newValue })
                                        }}
                                        disablePortal
                                        options={profilesOptions}
                                        renderInput={(params) => <TextField {...params} label='Perfil' size={'small'} fullWidth required />}
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
                    <UsersGrid update={usersGridState} />
                </Grid>
            </Grid>
        </>
    )
}

function userDataDefault() {
    return {
        user: '',
        name: '',
        pass: '1234',
        profile: { id: 0, key: 0, label: '' }
    }
}