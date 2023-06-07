import React, { useState, useEffect } from 'react'
import { Grid, TextField, Box, Paper, Typography } from '@mui/material'
import AppPaper from '../AppPaper/AppPaper'
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line,
PieChart, Pie } from 'recharts'
import moment from 'moment'

const sales = require('../../promises/sales')
const salesDetails = require('../../promises/salesDetails')
const utils = require('../../utils')

export default function SalesReport() {
    const [filterDates, setFilterDates] = useState({ start: moment(new Date).format('YYYY-MM-DD 00:00'), end: moment(new Date).format('YYYY-MM-DD 23:59') })
    const [title, setTitle] = useState('')
    const [salesChartData, setSalesChartData] = useState([])
    const [productsChartData, setProductsChartData] = useState([])

    useEffect(() => {
        sales.findAllBetweenDateGroupByDate(filterDates.start, filterDates.end)
            .then((res) => {
                console.log('Sales', res)
                let data = res.map((item) => ({
                    date: moment(item.date).format('DD-MM-YYYY'),
                    monto: parseInt(item.total_amount),
                    name: moment(item.date).format('DD-MM-YYYY'),
                }))
                setSalesChartData(data)
            })
            .catch(err => { console.error(err) })
    }, [filterDates])

    useEffect(() => {
        salesDetails.findAllBetweenDateGroupByProduct(filterDates.start, filterDates.end)
            .then((res) => {
                console.log(res)
            })
            .catch(err => { console.error(err) })


    }, [filterDates])

    useEffect(() => {
        if (moment(filterDates.start).format('DD-MM-YYYY') == moment(filterDates.end).format('DD-MM-YYYY')) {
            setTitle('del ' + moment(filterDates.start).format('DD-MM-YYYY'))
        } else {
            setTitle('del ' + moment(filterDates.start).format('DD-MM-YYYY') + ' al ' + moment(filterDates.end).format('DD-MM-YYYY'))
        }
    }, [filterDates])

    const formatY = (value) => {
        if (value == null || value == undefined) {
            value = 0
        }
        if (value < 0) {
            value = value.toString()
            value = value.replace(/[^0-9]/g, '')
            value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
            value = '$ -' + value
            return value
        } else {
            value = value.toString()
            value = value.replace(/[^0-9]/g, '')
            value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
            value = '$' + value
            return value
        }
    }

    const fortmatX = (value) => {
        return moment(value).format('dd')
    }

    const formatTooltipText = (value, name, entry) => {
        return utils.renderMoneystr(value)
    }

    const colors = ['#98FF17', '#25E80C', '#01FF45', '#0CE896', '#42FF17', '#0CE839', '#00FF90', '#0CE8D8']

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
                                    label="Fecha final"
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
                    <Paper variant={'outlined'} sx={{ p: 1 }}>
                        <Grid container spacing={1} p={1}>
                            <Grid item xs={12}>
                                <Typography variant={'h5'} textAlign={'center'}>Reporte de ventas</Typography>
                                <Typography variant={'body1'} textAlign={'center'}>{title}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <AppPaper title="Ventas por día">
                                    <Box p={1}>
                                        <ResponsiveContainer width={'100%'} height={200}>
                                            <LineChart data={salesChartData}>
                                                <CartesianGrid strokeDasharray="3 2" />
                                                <XAxis dataKey={'name'} fontSize={10} />
                                                <YAxis tickFormatter={formatY} fontSize={10} />
                                                <Tooltip formatter={formatTooltipText} />
                                                <Line type="monotone" dataKey="monto" stroke="#1a9358" activeDot={{ r: 8 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </AppPaper>
                            </Grid>
                            <Grid item xs={12}>
                                <AppPaper title="Productos mas vendidos">
                                    <Box p={1}>
                                        <ResponsiveContainer width={'100%'} height={200}>
                                            <PieChart width={400} height={400}>
                                            <Pie data={productsChartData} dataKey="value" cx="50%" cy="50%" outerRadius={60} fill="#8884d8" />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </AppPaper>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </>

    )
}
