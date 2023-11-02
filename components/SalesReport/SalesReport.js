import React, { useState, useEffect } from 'react'
import { Grid, TextField, Box, Paper, Typography, IconButton } from '@mui/material'
import AppPaper from '../AppPaper/AppPaper'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker'



import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line,
    PieChart, Pie, Cell
} from 'recharts'
import moment from 'moment'



const sales = require('../../promises/sales')
const salesDetails = require('../../promises/salesDetails')
const utils = require('../../utils')
// import html2pdf from 'html2pdf.js'

export default function SalesReport() {
    const [filterDates, setFilterDates] = useState({ start: moment(new Date).format('YYYY-MM-DD 00:00'), end: moment(new Date).format('YYYY-MM-DD 23:59') })
    const [title, setTitle] = useState('')
    const [salesChartData, setSalesChartData] = useState([])
    const [productsQuantyChartData, setProductsQuantyChartData] = useState([])
    const [productsAmountChartData, setProductsAmountChartData] = useState([])
    const [salesTotal, setSalesTotal] = useState(0)
    const [salesPaymentChartData, setSalesPaymentChartData] = useState([])
    const [salesTaxTotal, setSalesTaxTotal] = useState(0)
    const [boletaTotal, setBoletaTotal] = useState(0)
    const [facturaTotal, setFacturaTotal] = useState(0)


    useEffect(() => {
        if (moment(filterDates.start).format('DD-MM-YYYY') == moment(filterDates.end).format('DD-MM-YYYY')) {
            setTitle('del ' + moment(filterDates.start).format('DD-MM-YYYY'))
        } else {
            setTitle('del ' + moment(filterDates.start).format('DD-MM-YYYY') + ' al ' + moment(filterDates.end).format('DD-MM-YYYY'))
        }
    }, [filterDates])

    useEffect(() => {
        salesDetails.findAllBetweenDateGroupByProduct(filterDates.start, filterDates.end)
            .then((res) => {
                const filteredData = res
                    .filter(item => item.Product !== null)
                    .map((item) => ({
                        name: item.Product.name,
                        total_quanty: item.total_quanty,
                        total_amount: item.total_amount
                    }))
                const sortedQuantyData = filteredData.sort((a, b) => b.total_quanty - a.total_quanty)
                const topNine = sortedQuantyData.slice(0, 9);
                const remainingTotalQuanty = sortedQuantyData.slice(9).reduce((acc, item) => acc + item.total_quanty, 0);
                const others = {
                    name: "otros",
                    total_quanty: remainingTotalQuanty
                }

                topNine.push(others)
                setProductsQuantyChartData(topNine)
            })
            .catch(err => { console.error(err) })
    }, [filterDates])

    useEffect(() => {
        salesDetails.findAllBetweenDateGroupByProduct(filterDates.start, filterDates.end)
            .then((res) => {
                const filteredData = res
                    .filter(item => item.Product !== null)
                    .map((item) => ({
                        name: item.Product.name,
                        total_amount: parseInt(item.total_amount)
                    }))
                const sortedAmountData = filteredData.sort((a, b) => b.total_amount - a.total_amount)
                const topNine = sortedAmountData.slice(0, 9);
                const remainingAmountQuanty = sortedAmountData.slice(9).reduce((acc, item) => acc + item.total_amount, 0);
                const others = {
                    name: "otros",
                    total_amount: remainingAmountQuanty
                }
                topNine.push(others)
                setProductsAmountChartData(topNine)
            })
            .catch(err => { console.error(err) })
    }, [filterDates])

    useEffect(() => {
        sales.findAllBetweenDateGroupByPayment(filterDates.start, filterDates.end)
            .then((res) => {
                // console.log('Payments', res)
                let data = res.map((item) => ({
                    name: item.payment_method,
                    monto: parseInt(item.total_amount),
                }))
                setSalesPaymentChartData(data)
            })
            .catch(err => { console.error(err) })
    }, [filterDates])

    useEffect(() => {
        sales.findAllBetweenDateGroupByDte(filterDates.start, filterDates.end)
            .then((res) => {
                let boleta = res.find(item => item.dte_code == 39)
                let factura = res.find(item => item.dte_code == 33)
                setSalesTaxTotal(parseInt(boleta.total_amount) + parseInt(factura.total_amount))
                setBoletaTotal(parseInt(boleta.total_amount))
                setFacturaTotal(parseInt(factura.total_amount))
            })
            .catch(err => { console.error(err) })

    }, [filterDates])


    useEffect(() => {
        sales.findAllBetweenDateGroupByDate(filterDates.start, filterDates.end)
            .then((res) => {
                console.log('Sales', res)
                let data = res.map((item) => ({
                    date: moment(item.date).format('DD-MM-YYYY'),
                    monto: parseInt(item.total_amount),
                    name: moment(item.date).format('DD-MM-YYYY'),
                }))
                const totalSum = data.reduce((accumulator, currentValue) => {
                    const amount = parseInt(currentValue.monto);
                    return accumulator + amount;
                }, 0)
                console.log('totalSum', totalSum)
                setSalesTotal(totalSum)
                setSalesChartData(data)
            })
            .catch(err => { console.error(err) })
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

    const formatTooltipText = (value, name, entry) => {
        return utils.renderMoneystr(value)
    }

    const formatTooltipTextPie1 = (value, name, entry) => {
        return value + ' unidades'
    }

    const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#00CED1', '#008000', '#808080', '#FFB6C1', '#DA70D6', '#8B4513']
    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        )
    }


    const pdf = () => {

        // const componenteHTML = document.getElementById('pdf-component');

        // html2pdf().from(componenteHTML).outputPdf('blob')
        //     .then(blob => {
        //         console.log('PDF en blob:', blob);
        //         const url = URL.createObjectURL(blob, { type: 'application/pdf' })
        //         window.open(url)
        //     })
    }






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
                            <Grid item textAlign={'right'} >
                                <IconButton onClick={() => { pdf() }}>
                                    <PictureAsPdfIcon />
                                </IconButton>

                            </Grid>
                            <Grid item textAlign={'right'} >


                            </Grid>
                        </Grid>
                    </AppPaper>
                </Grid>
                <Grid item xs={10}>
                    <div id="pdf-component">
                        <Paper variant={'outlined'} sx={{ p: 1, maxWidth: 780 }}>
                            <Grid container spacing={1} p={1}>
                                <Grid item xs={12} pt={2}>
                                    <Typography variant={'h5'} textAlign={'center'}>Reporte de ventas</Typography>
                                    <Typography variant={'body1'} textAlign={'center'}>{title}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <AppPaper title="Ventas totales del periodo">
                                        <Box p={1}>
                                            <Typography variant={'body1'}>{utils.renderMoneystr(salesTotal)}</Typography>
                                        </Box>
                                    </AppPaper>
                                </Grid>
                                <Grid item xs={12}>
                                    <AppPaper title="Ventas afectas del periodo">
                                        <Box p={1} display={'flex'}>
                                            <Box flexGrow={1}>
                                                <Typography variant={'body2'}>Total ventas afectas</Typography>
                                                <Typography variant={'body1'}>{utils.renderMoneystr(salesTaxTotal)}</Typography>
                                            </Box>
                                            <Box flexGrow={1}>
                                                <Typography variant={'body2'}>Iva</Typography>
                                                <Typography variant={'body1'}>{utils.renderMoneystr(parseInt(salesTaxTotal * 0.19))}</Typography>
                                            </Box>
                                            <Box flexGrow={1}>
                                                <Typography variant={'body2'}>Total boletas</Typography>
                                                <Typography variant={'body1'}>{utils.renderMoneystr(boletaTotal)}</Typography>
                                            </Box>
                                            <Box flexGrow={1}>
                                                <Typography variant={'body2'}>Total facturas</Typography>
                                                <Typography variant={'body1'}>{utils.renderMoneystr(facturaTotal)}</Typography>
                                            </Box>
                                        </Box>
                                    </AppPaper>
                                </Grid>
                                <Grid item xs={12}>
                                    <AppPaper title="Ventas por día">
                                        <Box p={1}>
                                            <ResponsiveContainer width={'100%'} height={180}>
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
                                <Grid item xs={6}>
                                    <AppPaper title="Top 10 - Productos por cantidad">
                                        <Box p={1}>
                                            <ResponsiveContainer width={'100%'} height={480}>
                                                <PieChart>
                                                    <Pie
                                                        data={productsQuantyChartData}
                                                        dataKey='total_quanty' cx="50%"
                                                        cy="50%" outerRadius={120}
                                                        labelLine={false}
                                                        label={renderCustomizedLabel}
                                                    >
                                                        {productsQuantyChartData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip formatter={formatTooltipTextPie1} />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    </AppPaper>
                                </Grid>
                                <Grid item xs={6}>
                                    <AppPaper title="Top 10 - Productos por monto">
                                        <Box p={1}>
                                            <ResponsiveContainer width={'100%'} height={480}>
                                                <PieChart>
                                                    <Pie
                                                        data={productsAmountChartData}
                                                        dataKey='total_amount' cx="50%"
                                                        cy="50%" outerRadius={120}
                                                        labelLine={false}
                                                        label={renderCustomizedLabel}
                                                    >
                                                        {productsAmountChartData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip formatter={formatTooltipText} />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    </AppPaper>
                                </Grid>
                                <div style={{ pageBreakBefore: 'always' }}></div>
                                <Grid item xs={12} textAlign={'right'} pt={2}>
                                    <Typography variant={'caption'} textAlign={'center'}>{'Reporte de ventas ' + title}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <AppPaper title="Ventas del periodo por medio de pago">
                                        <Box p={1}>
                                            <ResponsiveContainer width={'100%'} height={250}>
                                                <BarChart width={'100%'} data={salesPaymentChartData}>
                                                    <CartesianGrid strokeDasharray="3 2" />
                                                    <XAxis dataKey={'name'} fontSize={10} />
                                                    <YAxis tickFormatter={formatY} fontSize={10} />
                                                    <Tooltip formatter={formatTooltipText} />
                                                    <Bar dataKey="monto" fill='#1a9358' />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    </AppPaper>
                                </Grid>
                            </Grid>
                        </Paper>
                    </div>

                </Grid>
            </Grid>
        </>

    )
}
