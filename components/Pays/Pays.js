import React, { useState, useEffect } from 'react'
import { Grid, TextField, Button } from '@mui/material'
import PaysGrid from '../Grids/PaysGrid'
import AppPaper from '../AppPaper/AppPaper'
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker'
import moment from 'moment';

const pays = require('../../promises/pays')
const customers = require('../../promises/customers')

export default function Pays() {
    const [filterDates, setFilterDates] = useState({ start: moment(new Date).format('YYYY-MM-DD'), end: moment(new Date).format('YYYY-MM-DD 23:59') })
    const [title, setTitle] = useState('Pagos')
    const [paysList, setPaysList] = useState([])

    useEffect(() => {
        if (moment(filterDates.start).format('DD-MM-YYYY') == moment(filterDates.end).format('DD-MM-YYYY')) {
            setTitle('Pagos del ' + moment(filterDates.start).format('DD-MM-YYYY'))
        } else {
            setTitle('Pagos del ' + moment(filterDates.start).format('DD-MM-YYYY') + ' al ' + moment(filterDates.end).format('DD-MM-YYYY'))
        }
    }, [filterDates])

    useEffect(() => {
        pays.findAllBetweenDates(filterDates.start, filterDates.end)
            .then((res) => {
                let data = res.map((item) => ({
                    id: item.id,
                    sale_id: item.sale_id,
                    customer_id: item.customer_id == null ? 0 : item.customer_id,
                    customer_name: item.customer_id == null ? 'Sin cliente' : '',
                    amount: item.amount,
                    payment_method: item.payment_method,
                    state: item.state == true ? 'Pagado' : 'Pendiente',
                    paid: item.paid,
                    balance: item.balance,
                    date: item.date,
                    createdAt: item.createdAt,
                }))
                data.map((item) => {
                    if (item.customer_id !== 0) {
                        customers.findOneById(item.customer_id)
                            .then((res) => {
                                if (res == null) {
                                    item.customer_name = 'Cliente eliminado'
                                } else {
                                    item.customer_name = res.name
                                }

                            })
                            .catch(err => { console.error(err) })
                    }
                })
                setPaysList(data)
            })
            .catch(err => { console.error(err) })
    }, [filterDates])





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
                    <PaysGrid title={title} paysList={paysList} hideCustomer={false} heightGrid={'80vh'}/>
                </Grid>
            </Grid>
        </>
    )
}
