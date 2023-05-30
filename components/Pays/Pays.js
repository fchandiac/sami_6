import React, { useState } from 'react'
import { Grid, TextField, Button } from '@mui/material'
import PaysGrid from '../Grids/PaysGrid'
import AppPaper from '../AppPaper/AppPaper'
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker'
import moment from 'moment';

export default function Pays() {
    const [filterDates, setFilterDates] = useState({ start: moment(new Date).format('YYYY-MM-DD'), end: moment(new Date).format('YYYY-MM-DD 23:59') })

    return (
        <>
            <Grid container spacing={1}>
                <Grid item xs={2}>
                    <AppPaper title="Filtro fechas">
                        <Grid container spacing={1} direction={'column'} p={1}>
                            <Grid item >
                                <DesktopDatePicker
                                    label="Fecha incial"
                                    inputFormat='DD-MM-YYYY'
                                    value={filterDates.start}
                                    onChange={(e) => { setFilterDates({ ...filterDates, start: e }) }}
                                    renderInput={(params) => <TextField {...params} size={'small'} fullWidth />}
                                />
                            </Grid>
                            <Grid item >
                                <DesktopDatePicker
                                    label="Fecha incial"
                                    inputFormat='DD-MM-YYYY'
                                    value={filterDates.end}
                                    onChange={(e) => { setFilterDates({ ...filterDates, end: e }) }}
                                    renderInput={(params) => <TextField {...params} size={'small'} fullWidth />}
                                />
                            </Grid>
                        </Grid>
                    </AppPaper>
                </Grid>
                <Grid item xs={10}>
                    <PaysGrid filterDates={filterDates}/>
                </Grid>
            </Grid>
        </>
    )
}
