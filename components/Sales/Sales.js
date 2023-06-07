import React, { useState, useEffect } from 'react'
import { Grid, TextField, Button, Box } from '@mui/material'
import AppPaper from '../AppPaper/AppPaper'
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker'
import moment from 'moment';
import SalesGrid from '../Grids/SalesGrid/SalesGrid'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const sales = require('../../promises/sales')
const utils = require('../../utils')

export default function Sales() {
    const [filterDates, setFilterDates] = useState({ start: moment(new Date).format('YYYY-MM-DD'), end: moment(new Date).format('YYYY-MM-DD 23:59') })
    const [chartData, setChartData] = useState([])

    useEffect(() => {
        let today = moment(new Date).format('YYYY-MM-DD 23:59:00')
        let start = moment(today).subtract(7, 'days').format('YYYY-MM-DD')
        sales.findAllBetweenDateGroupByDate(start, today)
            .then((res) => {
                let data = res.map((item) => ({
                    date: moment(item.date).format('DD-MM-YYYY'),
                    monto: parseInt(item.total_amount),
                    name: moment(item.date).format('ddd'),
                    color: '#98FF17'
                }))
                setChartData(data)
            })
            .catch(err => { console.error(err) })
    }, [])

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
        // Personaliza el contenido de texto del tooltip aquí
        return utils.renderMoneystr(value)
      }
      const colors = ['#98FF17', '#25E80C', '#01FF45', '#0CE896', '#42FF17', '#0CE839', '#00FF90', '#0CE8D8' ]
    return (
        <>
            <Grid container spacing={1}>
                <Grid item xs={4}>
                    <Grid container spacing={1} direction={'column'}>
                        <Grid item>
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
                        <Grid item>
                            <AppPaper title="Gráfico de ventas ultimos 7 días">
                                <Box p={1}>
                                    <ResponsiveContainer width={'100%'} height={300}>
                                        <BarChart width={'100%'} data={chartData}>
                                            <CartesianGrid strokeDasharray="3 2" />
                                            <XAxis  dataKey={'name'} fontSize={10}/>
                                            <YAxis tickFormatter={formatY} fontSize={10}/>
                                            <Tooltip formatter={formatTooltipText}/>
                                            <Bar dataKey="monto" fill='#1a9358' />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </AppPaper>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={8}>
                    <SalesGrid filterDates={filterDates} />
                </Grid>
            </Grid>
        </>
    )
}
