import React, { useEffect, useState } from 'react'
import {
    Dialog, DialogContent, DialogTitle, DialogActions, Button, TextField, Grid, Chip,
    Typography, FormGroup, FormControlLabel, Checkbox, Autocomplete, IconButton, Stack, Switch
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import AppPaper from '../AppPaper/AppPaper'
import { useAppContext } from '../../AppProvider'
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker'
import electron, { BrowserWindow } from 'electron'
import moment from 'moment'
const ipcRenderer = electron.ipcRenderer || false
const lioren = require('../../promises/lioren')
const sales = require('../../promises/sales')
const salesDetails = require('../../promises/salesDetails')
const pays = require('../../promises/pays')
const stocks = require('../../promises/stocks')
const utils = require('../../utils')
const https = require('https');
const PDF417 = require("pdf417-generator")
const customers = require('../../promises/customers')
const orders = require('../../promises/orders')
import SaveIcon from '@mui/icons-material/Save'



export default function Invoice(props) {
    const { open, setOpen, setOpenChangeDialog, setOpenPayDialog, paymentMethod, stockControl, customerForInvoice } = props
    const { dispatch, cart, movements, user, ordersInCart } = useAppContext()
    const [openFindCustomerDialog, setOpenFindCustomerDialog] = useState(false)
    const [customerData, setCustomerData] = useState(customerDataDefault())
    const [requestData, setRequestData] = useState({ rut: '', razon_social: '', actividades: [{ giro: '' }] })
    const [comunasOptions, setComunasOptions] = useState(comunas)
    const [comunasInput, setComunasInput] = useState('')
    const [ciudadesOptions, setCiudadesOptions] = useState(ciudades)
    const [ciudadesInput, setCiudadesInput] = useState('')
    const [pdfView, setPdfView] = useState(false)
    const [showReference, setShowReference] = useState(false)
    const [docsRefinput, setDocsRefInput] = useState('')
    const [docsRefOptions, setDocsRefOptions] = useState(docsRef())
    const [referenceData, setReferenceData] = useState(referenceDataDefault())
    const [printer, setPrinter] = useState({ idVendor: 0, idProduct: 0 })
    const [ticketInfo, setTicketInfo] = useState({ name: '', address: '', phone: '', rut: '' })
    const [thermalPrinting, setThermalPrinting] = useState(true)
    const [showPay, setShowPay] = useState(false)
    const [payData, setPayData] = useState(payDataDefault())
    const [paymentMethodsOptions, setPaymentMethodsOptions] = useState([])
    const [paymentMethodsInput, setPaymentMethodsInput] = useState('')
    const [customerInput, setCustomerInput] = useState('')
    const [customerOptions, setCustomerOptions] = useState([])
    const [customer, setCustomer] = useState({ key: 0, id: 0, rut: '', label: '', activity: '', district: 0, city: 0, address: '' })
    const [findCustomerData, setFindCustomerData] = useState(findCustomerDataDefault())
    const [token, setToken] = useState('')

    useEffect(() => {
        let printer = ipcRenderer.sendSync('get-printer', 'sync')
        let ticket_info = ipcRenderer.sendSync('get-ticket-info', 'sync')
        let token = ipcRenderer.sendSync('get-lioren', 'sync').token
        setPrinter(printer)
        setTicketInfo(ticket_info)
        setToken(token)
    }, [])


    useEffect(() => {
        if (customerForInvoice.id !== 0) {
            customers.findOneById(customerForInvoice.id)
                .then(res => {
                    console.log(res)
                    setCustomer({
                        key: res.id,
                        id: res.id,
                        rut: res.rut,
                        label: res.name,
                        activity: res.activity,
                        district: res.district,
                        city: res.city,
                        address: res.address
                    })
                    setCustomerData({
                        rut: utils.formatRut(res.rut),
                        razon_social: res.name,
                        direccion: res.address,
                        ciudad: ciudadesOptions.find(item => item.id === res.city),
                        comuna: comunasOptions.find(item => item.id === res.district),
                        giro: res.activity
                    })
                })
                .catch(err => console.log(err))
        }
    }, [open])



    useEffect(() => {
        customers.findAll()
            .then(res => {
                let data = res.map((item) => ({
                    label: item.name,
                    key: item.id,
                    rut: item.rut,
                    id: item.id,
                    activity: item.activity,
                    district: item.district,
                    city: item.city,
                    address: item.address
                }))
                setCustomerOptions(data)
            })
            .catch(err => console.log(err))
    }, [])

    useEffect(() => {
        lioren.mediosDePago(token)
            .then(res => {
                let data = res.mediopagos.map((item) => ({
                    label: item.nombre,
                    id: item.id,
                    key: item.id,
                }))
                setPaymentMethodsOptions(data)
            })
            .catch(err => { console.log(err) })

    }, [])



    useEffect(() => {
        if (customerData.rut !== ''){
            let data = ciudadesOptions.filter((item) => item.region_id === customerData.comuna.region_id)
            setCiudadesOptions(data)
        } 
    }, [customerData.comuna])


    const findCustomer = () => {
        //    lioren.receptor(customerData.rut)
        //    .then(res => {console.log(res)})
        //      .catch(err => {console.log(err)})
        //curl -X GET 'https://siichile.herokuapp.com/consulta?rut=76.118.195-5'

        let path = '/consulta?rut=' + utils.formatRut(customerData.rut)

        const options = {
            hostname: 'siichile.herokuapp.com',
            path: path,
            method: 'GET'
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                console.log(data);
                const jsonObject = JSON.parse(data)
                if (jsonObject.hasOwnProperty('error')) {
                    dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'Rut no encontrado' } })
                } else {
                    //setRequestData(jsonObject)
                    setCustomerData({
                        ...customerData,
                        razon_social: jsonObject.razon_social,
                        giro: jsonObject.actividades[0].giro,
                        comuna: { label: '', id: 0, key: 0, region_id: 0 },
                        ciudad: { label: '', id: 0, key: 0, region_id: 0 },
                        direccion: '',
                    })

                    console.log(jsonObject)
                }
            })
        })
        req.on('error', (error) => {
            dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'Error en busqueda de Rut' } })
            //setRequestData({ rut: '', razon_social: '', actividades: [{ giro: '' }] })
            console.error(error)
        });
        req.end()
    }

    const formatCart = () => {
        let data = cart.map((item) => ({
            codigo: item.code,
            nombre: item.name,
            cantidad: item.quanty,
            precio: (item.sale / 1.19),
            exento: false
        }))
        return data
    }

    const printMode = () => {
        if (thermalPrinting && pdfView) {
            return 0
        } else if (thermalPrinting && !pdfView) {
            return 1
        } else if (!thermalPrinting && pdfView) {
            return 2
        } else if (!thermalPrinting && !pdfView) {
            return 3
        }
    }

    const total = () => {
        let cartForTotal = cart.map((item) => ({ value: ((item.sale / 1.19) * item.quanty) * 1.19 }))
        let sumProducts = cartForTotal.reduce((a, b) => a + b.value, 0)
        let total = sumProducts
        console.log('Total', parseInt(total))
        return total
    }

    const printInfo = (factura, sale_id) => {
        let stamp_str = stamp(factura.xml)
        let canvas = document.createElement('canvas')
        PDF417.draw(stamp_str, canvas, 2, 2, 1.5)
        let stamp_img = canvas.toDataURL('image/jpg')
        let date = moment(new Date()).format('DD-MM-yyyy')
        let time = moment(new Date()).format('HH:mm')
        let printInfo = {
            printer: printer,
            stamp: stamp_img,
            date: date, time: time,
            name: ticketInfo.name,
            rut: ticketInfo.rut,
            address: ticketInfo.address,
            phone: ticketInfo.phone,
            total: factura.montototal,
            iva: factura.montoiva,
            invoiceNumber: factura.folio,
            cart: cart,
            customer: customerData,
            paymentMethod: paymentMethod,
            sale_id: sale_id
        }

        return printInfo
    }

    const closeOrders = async () => {
        for (const order of ordersInCart) {
            await orders.updateState(order.order_id, true)
        }
        dispatch({ type: 'SET_ORDERS_IN_CART', value: [] })
    }

    const printDocument = async (pdf, printInfo) => {
        switch (printMode()) {
            case 0:
                //thermalPrinting && pdfView
                if (await ipcRenderer.invoke('find-printer', printer) == false) {
                    dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'Error de conexión con la impresora' } })
                } else {
                    // console.log('PPPDDDFFF')
                    // console.log(pdf)
                    const pdfData = Buffer.from(pdf, 'base64')
                    const pdfUrl = URL.createObjectURL(new Blob([pdfData], { type: 'application/pdf' }));
                    window.open(pdfUrl)
                    if (ordersInCart.length > 0) {
                        await closeOrders()
                    }
                    ipcRenderer.send('factura', printInfo)


                }
                break
            case 1:
                //thermalPrinting && !pdfView
                if (await ipcRenderer.invoke('find-printer', printer) == false) {
                    dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'Error de conexión con la impresora' } })
                } else {
                    if (ordersInCart.length > 0) {
                        await closeOrders()
                    }
                    ipcRenderer.send('factura', printInfo)
                }
                break
            case 2:
                //!thermalPrinting && pdfView
                const pdfData = Buffer.from(pdf, 'base64')
                const pdfUrl = URL.createObjectURL(new Blob([pdfData], { type: 'application/pdf' }));
                window.open(pdfUrl)
                if (ordersInCart.length > 0) {
                    await closeOrders()
                }
                break
            case 3:
                //!thermalPrinting && !pdfView
                console.log('factura no PDF no Thermal', factura)
                dispatch({ type: 'OPEN_SNACK', value: { type: 'success', message: 'Factura enviada al Sii' } })
                if (ordersInCart.length > 0) {
                    await closeOrders()
                }
                break
            default:
                break
        }

    }

    const facturaData = () => {
        // console.log('detalles', formatCart())
        const data = {
            "emisor": {
                "tipodoc": "33",
                "fecha": moment(new Date()).format('YYYY-MM-DD'),
            },
            "receptor": {
                "rut": customerData.rut.replace(/\./g, ""),
                "rs": customerData.razon_social,
                "giro": customerData.giro.substring(0, 39),
                "comuna": customerData.comuna.id,
                "ciudad": customerData.ciudad.id,
                "direccion": customerData.direccion
            },
            "detalles": formatCart(),
            "referencias": [],
            "pagos": [],
            "expects": "all"
        }


        let ref = {
            "fecha": moment(new Date()).format('YYYY-MM-DD'),
            "tipodoc": referenceData.tipodoc.key.toString(),
            "folio": referenceData.folio,
            "razon": 4,
            "glosa": referenceData.glosa.substring(0, 70)
        }

        if (showReference == true) {
            console.log('show reference', showReference)
            data.referencias.push(ref)
        }

        let pay = {
            "fecha": moment(payData.fecha).format('YYYY-MM-DD'),
            "mediopago": payData.mediopago.id,
            "monto": total(),
            "glosa": "",
            "cobrar": true
        }

        if (showPay == true) {
            data.pagos.push(pay)
        }

        return data

    }

    const renderReference = () => {
        if (showReference) {
            return (
                <AppPaper title={'Referencia'}>
                    <Grid container spacing={1} p={1}>
                        <Grid item xs={6} sm={6} md={6} lg={6}>
                            <Autocomplete
                                inputValue={docsRefinput}
                                onInputChange={(e, newInputValue) => {
                                    setDocsRefInput(newInputValue)
                                }}
                                isOptionEqualToValue={(option, value) => null || option.id === value.id}
                                value={referenceData.tipodoc}
                                onChange={(e, newValue) => {
                                    setReferenceData({ ...referenceData, tipodoc: newValue })
                                }}
                                disablePortal
                                options={docsRefOptions}
                                renderInput={(params) => <TextField {...params} label='Documento' size={'small'} fullWidth required />}
                            />
                        </Grid>
                        <Grid item xs={6} sm={6} md={6} lg={6}>
                            <DesktopDatePicker
                                label="Fecha"
                                inputFormat='DD-MM-YYYY'
                                value={referenceData.date}
                                onChange={(e) => {
                                    setReferenceData({ ...referenceData, date: e })
                                }}
                                renderInput={(params) => <TextField {...params} size={'small'} fullWidth />}
                            />
                        </Grid>
                        <Grid item xs={6} sm={6} md={6} lg={6}>
                            <TextField
                                label='Folio'
                                value={referenceData.folio}
                                onChange={(e) => { setReferenceData({ ...referenceData, folio: e.target.value }) }}
                                variant="outlined"
                                size={'small'}
                                inputProps={{ minLength: 6 }}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={6} sm={6} md={6} lg={6}>
                            <TextField
                                label='Glosa'
                                value={referenceData.glosa}
                                onChange={(e) => { setReferenceData({ ...referenceData, glosa: e.target.value }) }}
                                variant="outlined"
                                size={'small'}
                                inputProps={{ minLength: 6, maxWidth: 70 }}
                                fullWidth
                                required
                            />
                        </Grid>
                    </Grid>
                </AppPaper>
            )
        }
    }

    const addDaysToPay = (quanty) => {
        let date = moment(new Date()).add(quanty, 'days')
        setPayData({ ...payData, date: date })

    }

    const renderPay = () => {
        if (showPay) {
            return (
                <AppPaper title={'Pago'}>
                    <Grid container spacing={1} p={1}>
                        <Grid item xs={4} sm={4} md={4} lg={4}>
                            <DesktopDatePicker
                                label="Fecha"
                                inputFormat='DD-MM-YYYY'
                                value={payData.date}
                                onChange={(e) => {
                                    setPayData({ ...payData, date: e })
                                }}
                                renderInput={(params) => <TextField {...params} size={'small'} fullWidth />}
                            />
                        </Grid>
                        <Grid item xs={4} sm={4} md={4} lg={4}>
                            <Autocomplete
                                inputValue={paymentMethodsInput}
                                onInputChange={(e, newInputValue) => {
                                    setPaymentMethodsInput(newInputValue)
                                }}
                                isOptionEqualToValue={(option, value) => null || option.id === value.id}
                                value={payData.mediopago}
                                onChange={(e, newValue) => {
                                    setPayData({ ...payData, mediopago: newValue })
                                }}
                                disablePortal
                                options={paymentMethodsOptions}
                                renderInput={(params) => <TextField {...params} label='Medio de pago' size={'small'} fullWidth required />}
                            />

                        </Grid>


                        <Grid item>
                            <Stack direction={'row'} spacing={1}>
                                <Chip
                                    label='30 días'
                                    onClick={() => { addDaysToPay(30) }}
                                />
                                <Chip
                                    label='60 días'
                                    onClick={() => { addDaysToPay(60) }}
                                />
                                <Chip
                                    label='90 días'
                                    onClick={() => { addDaysToPay(90) }}
                                />
                            </Stack>

                        </Grid>
                    </Grid>
                </AppPaper>
            )
        }
    }

    const saveCustomer = async () => {
        const findCustomer = await customers.findOneByRut(customerData.rut)
        console.log('findCustomer', findCustomer)
        if (findCustomer == undefined) {
            customers.create(customerData.rut, customerData.razon_social, customerData.giro, customerData.comuna.id, customerData.ciudad.id, customerData.direccion)
                .then(() => {
                    customers.findAll()
                        .then(res => {
                            let data = res.map((item) => ({
                                label: item.name,
                                key: item.id,
                                rut: item.rut,
                                id: item.id,
                                activity: item.activity,
                                district: item.district,
                                city: item.city,
                                address: item.address
                            }))
                            console.log(data)
                            setCustomerOptions(data)
                            dispatch({ type: 'OPEN_SNACK', value: { type: 'success', message: 'Cliente guardado' } })
                        })
                        .catch(err => console.log(err))
                })
                .catch(err => console.log(err))
        } else {
            dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'Cliente ya existe' } })
        }

    }

    const saleDetailAll = (sale_id, cart) => {
        let details = []
        cart.map(product => {
            details.push(salesDetails.create(sale_id, product.id, product.quanty, product.sale, product.discount, product.subTotal, product.name))
        })

        return Promise.all(details)
    }

    const saleFactura = (dte_number, total) => {
        const pr = new Promise((resolve, reject) => {
            sales.create(total, paymentMethod, 33, dte_number, stockControl)
                .then(res => {
                    let movs = movements.movements
                    movs.push({
                        sale_id: res.id,
                        user: user.name,
                        type: 1004,
                        amount: total,
                        payment_method: paymentMethod,
                        balance: movements.balance + total,
                        dte_code: 33,
                        dte_number: dte_number,
                        date: new Date()
                    })
                    let newMov = {
                        state: true,
                        balance: movements.balance + total,
                        movements: movs
                    }
                    ipcRenderer.send('update-movements', newMov)
                    dispatch({ type: 'SET_MOVEMENTS', value: newMov })
                    resolve(res)
                })
                .catch(err => {
                    console.log(err)
                    reject(err)
                })
        })
        return pr
    }
    const updateStocks = (cart) => {
        let newStocks = []
        cart.map(product => {
            newStocks.push(stocks.updateByProductAndStorage(product.id, 1001, product.virtualStock))
        })
        return Promise.all(newStocks)
    }

    const savePay = async (paymentMethod, sale_id, amount, client_id) => {
        const pay = new Promise((resolve, reject) => {
            let paymentMethods = ipcRenderer.sendSync('get-payment-methods', 'sync')
            let customerCredit = ipcRenderer.sendSync('get-customer-credit', 'sync')
            paymentMethods.unshift({ name: customerCredit.name, pay: false })
            paymentMethods.unshift({ name: 'Efectivo', pay: true })
            let state = paymentMethods.find(method => method.name == paymentMethod).pay
            let date = showPay ? payData.date : new Date()
            pays.create(sale_id, client_id, amount, paymentMethod, state, date)
                .then(res => {
                    resolve(res)
                })
                .catch(err => {
                    console.log(err)
                    reject(err)
                })
        })
        return pay
    }

    const proccessFactura = async () => {
        try {
            let data = facturaData()
            const factura = await lioren.factura(token, data)
            const sale = await saleFactura(factura.folio, factura.montototal)
            await saleDetailAll(sale.id, cart)
            let print_info = printInfo(factura, sale.id)
            if (stockControl) {
                await updateStocks(cart)
                const alerts = await stocks.findAllStockAlert()
                console.log('alerts', alerts)
                dispatch({ type: 'SET_STOCK_ALERT_LIST', value: alerts })

            }
            savePay(paymentMethod, sale.id, factura.montototal, customer.id)
            printDocument(factura.pdf, print_info)
            setOpenPayDialog(false)
            setOpen(false)
            setCustomerData(customerDataDefault())
            setCustomer({ key: 0, id: 0, rut: '', label: '', activity: '', district: 0, city: 0, address: '' })
            setReferenceData(referenceDataDefault())
            setPayData(payDataDefault())
            setOpenChangeDialog(true)
            console.log('factura', factura)
        } catch (err) {
            console.log(err)
            dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'Error durante el proceso' } })
        }

    }

    const factura = async () => {
        try {
            if (printMode() == 0 || printMode() == 1) {
                const findPrinter = await ipcRenderer.invoke('find-printer', printer)
                if (findPrinter) {
                    proccessFactura()
                } else {
                    dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'Error de conexión con la impresora' } })
                }
            } else {
                proccessFactura()
            }

        } catch (err) {
            console.log(err)
            dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'Error en el proceso' } })
        }
    }


    return (
        <>
            <Dialog open={open} fullWidth maxWidth={'md'}>
                <form onSubmit={(e) => { e.preventDefault(); factura() }}>
                    <DialogTitle sx={{ p: 2 }}>Factura</DialogTitle>
                    <DialogContent sx={{ p: 2 }}>
                        <Grid container spacing={1} direction={'column'}>
                            <Grid item marginTop={1}>
                                <AppPaper title={'Receptor'}>
                                    <Grid container spacing={1} p={1}>
                                        <Grid item xs={12} sm={12} md={12} lg={12}>
                                            <Autocomplete
                                                inputValue={customerInput}
                                                onInputChange={(e, newInputValue) => {
                                                    setCustomerInput(newInputValue)
                                                }}
                                                isOptionEqualToValue={(option, value) => null || option.id === value.id}
                                                value={customer}
                                                onChange={(e, newValue) => {
                                                    setCustomer(newValue)
                                                    console.log('newValue', newValue)
                                                    if (newValue !== null) {
                                                        customerData.rut = utils.formatRut(newValue.rut)
                                                        customerData.razon_social = newValue.label
                                                        customerData.direccion = newValue.address
                                                        customerData.ciudad = ciudadesOptions.find(item => item.id === newValue.city)
                                                        customerData.comuna = comunasOptions.find(item => item.id === newValue.district)
                                                        customerData.giro = newValue.activity
                                                    }

                                                }}
                                                disablePortal
                                                options={customerOptions}
                                                renderInput={(params) => <TextField {...params} label='Cliente' size={'small'} fullWidth required />}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={12} md={12} lg={12}>
                                            <Stack direction={'row'} spacing={1}>
                                                <TextField
                                                    label='Rut'
                                                    value={customerData.rut}
                                                    onChange={(e) => { setCustomerData({ ...customerData, rut: utils.formatRut(e.target.value) }) }}
                                                    variant="outlined"
                                                    size={'small'}
                                                    fullWidth
                                                    required
                                                />
                                                <IconButton onClick={() => { findCustomer() }}>
                                                    <SearchIcon />
                                                </IconButton>
                                                <IconButton onClick={() => { saveCustomer() }}>
                                                    <SaveIcon />
                                                </IconButton>
                                            </Stack>
                                        </Grid>
                                        <Grid item xs={12} sm={12} md={12} lg={12}>
                                            <TextField
                                                label='Razon social'
                                                value={customerData.razon_social}
                                                onChange={(e) => { setCustomerData({ ...customerData, razon_social: e.target.value }) }}
                                                variant="outlined"
                                                size={'small'}
                                                inputProps={{ minLength: 6 }}
                                                fullWidth
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={12} md={12} lg={12}>
                                            <TextField
                                                label='Giro'
                                                value={customerData.giro}
                                                onChange={(e) => { setCustomerData({ ...customerData, giro: e.target.value }) }}
                                                variant="outlined"
                                                size={'small'}
                                                inputProps={{ minLength: 6 }}
                                                fullWidth
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={6} sm={6} md={6} lg={6}>
                                            <Autocomplete
                                                inputValue={comunasInput}
                                                onInputChange={(e, newInputValue) => {
                                                    setComunasInput(newInputValue)
                                                }}
                                                isOptionEqualToValue={(option, value) => null || option.id === value.id}
                                                value={customerData.comuna}
                                                onChange={(e, newValue) => {
                                                    setCustomerData({ ...customerData, comuna: newValue })
                                                    //setCiudadesInput('')
                                                    // setCustomerData({ ...customerData, ciudad: { key: 0, label: '', id: 0, region_id: 0 } })
                                                }}
                                                disablePortal
                                                options={comunasOptions}
                                                renderInput={(params) => <TextField {...params} label='Comuna' size={'small'} fullWidth required />}
                                            />
                                        </Grid>
                                        <Grid item xs={6} sm={6} md={6} lg={6}>
                                            <Autocomplete
                                                inputValue={ciudadesInput}
                                                onInputChange={(e, newInputValue) => {
                                                    setCiudadesInput(newInputValue)
                                                }}
                                                isOptionEqualToValue={(option, value) => null || option.id === value.id}
                                                value={customerData.ciudad}
                                                onChange={(e, newValue) => {
                                                    setCustomerData({ ...customerData, ciudad: newValue })
                                                }}
                                                disablePortal
                                                options={ciudadesOptions}
                                                renderInput={(params) => <TextField {...params} label='Ciudad' size={'small'} fullWidth required />}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={12} md={12} lg={12}>
                                            <TextField
                                                label='Dirección'
                                                value={customerData.direccion}
                                                onChange={(e) => { setCustomerData({ ...customerData, direccion: e.target.value }) }}
                                                type='text'
                                                inputProps={{ minLength: 6 }}
                                                variant="outlined"
                                                size={'small'}
                                                fullWidth
                                                required
                                            />
                                        </Grid>
                                        <Grid item textAlign={'right'}>

                                        </Grid>
                                    </Grid>
                                </AppPaper>
                            </Grid>


                            <Grid item textAlign={'right'}>
                                <FormControlLabel sx={{ flexDirection: 'row-reverse' }}
                                    control={
                                        <Switch
                                            checked={showReference}
                                            onChange={(e) => { setShowReference(e.target.checked) }}
                                        />
                                    }
                                    label="Referencia"
                                />
                            </Grid>

                            <Grid item marginTop={1} sx={{ display: showReference ? 'block' : 'none' }}>
                                {renderReference()}
                            </Grid>

                            <Grid item textAlign={'right'}>
                                <FormControlLabel sx={{ flexDirection: 'row-reverse' }}
                                    control={
                                        <Switch
                                            checked={showPay}
                                            onChange={(e) => { setShowPay(e.target.checked) }}
                                        />
                                    }
                                    label="Pago"
                                />
                            </Grid>

                            <Grid item marginTop={1} sx={{ display: showPay ? 'block' : 'none' }}>
                                {renderPay()}
                            </Grid>



                            <Grid item textAlign={'right'}>
                                <FormControlLabel sx={{ flexDirection: 'row-reverse' }}
                                    control={
                                        <Switch
                                            checked={thermalPrinting}
                                            onChange={(e) => { setThermalPrinting(e.target.checked) }}

                                        />
                                    }
                                    label="Impresión térmica"
                                />
                            </Grid>



                            <Grid item textAlign={'right'}>
                                <FormControlLabel sx={{ flexDirection: 'row-reverse' }}
                                    control={
                                        <Switch
                                            checked={pdfView}
                                            onChange={(e) => { setPdfView(e.target.checked) }}

                                        />
                                    }
                                    label="PDF"
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button variant={'contained'} type='submit'>enviar</Button>
                        <Button variant={'outlined'} onClick={() => { setOpen(false); setCustomerData(customerDataDefault()); setCustomer({ key: 0, id: 0, rut: '', label: '', activity: '', district: 0, city: 0, address: '' }) }}>Cerrar</Button>
                    </DialogActions>
                </form>
            </Dialog>
            <Dialog open={openFindCustomerDialog} fullWidth maxWidth={'xs'}>
                <DialogTitle sx={{ p: 2 }}>Busqueda Receptor</DialogTitle>
                <DialogContent sx={{ p: 2 }}>
                    <Grid container spacing={1} direction={'column'}>
                        <Grid item>
                            <TextField label="Rut"
                                value={customerData.rut}
                                onChange={(e) => { setCustomerData({ ...customerData, rut: utils.formatRut(e.target.value) }) }}
                                variant="outlined"
                                size={'small'}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item>
                            <TextField label="Nombre / Razón Social"
                                value={customerData.name}
                                onChange={(e) => { setCustomerData({ ...customerData, name: e.target.value }) }}
                                variant="outlined"
                                size={'small'}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item>
                            <TextField label="Giro"
                                value={customerData.activity}
                                onChange={(e) => { setCustomerData({ ...customerData, activity: e.target.value }) }}
                                variant="outlined"
                                size={'small'}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item>
                            <Autocomplete
                                inputValue={comunasInput}
                                onInputChange={(e, newInputValue) => {
                                    setComunasInput(newInputValue)
                                }}
                                isOptionEqualToValue={(option, value) => null || option.id === value.id}
                                value={customerData.district}
                                onChange={(e, newValue) => {
                                    setCustomerData({ ...customerData, district: newValue })
                                    //setCiudadesInput('')
                                    // setCustomerData({ ...customerData, ciudad: { key: 0, label: '', id: 0, region_id: 0 } })
                                }}
                                disablePortal
                                options={comunasOptions}
                                renderInput={(params) => <TextField {...params} label='Comuna' size={'small'} fullWidth required />}
                            />
                        </Grid>
                        <Grid item>
                            <Autocomplete
                                inputValue={ciudadesInput}
                                onInputChange={(e, newInputValue) => {
                                    setCiudadesInput(newInputValue)
                                }}
                                isOptionEqualToValue={(option, value) => null || option.id === value.id}
                                value={customerData.city}
                                onChange={(e, newValue) => {
                                    setFindCustomerData({ ...findCustomerData, city: newValue })
                                }}
                                disablePortal
                                options={ciudadesOptions}
                                renderInput={(params) => <TextField {...params} label='Ciudad' size={'small'} fullWidth required />}
                            />
                        </Grid>
                        <Grid item>
                            <TextField label="Dirección"
                                value={findCustomerData.address}
                                onChange={(e) => { setFindCustomerData({ ...findCustomerData, address: e.target.value }) }}
                                variant="outlined"
                                size={'small'}
                                fullWidth
                                required
                            />
                        </Grid>


                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button variant={'outlined'} onClick={() => { setOpenFindCustomerDialog(false) }}>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}


function customerDataDefault() {
    return {
        rut: '',
        razon_social: '',
        giro: '',
        direccion: '',
        comuna: { key: 0, label: '', id: 0, region_id: 0 },
        ciudad: { key: 0, label: '', id: 0, region_id: 0 },
    }
}

function referenceDataDefault() {
    return {
        fecha: new Date(),
        tipodoc: { key: 0, label: '' },
        folio: "",
        razon: 4,
        glosa: "",
    }
}

function payDataDefault() {
    return {
        fecha: new Date(),
        mediopago: { key: 0, label: '', id: 0 },
    }

}

function findCustomerDataDefault() {
    return ({
        rut: '',
        name: '',
        activity: '',
        district: { key: 0, id: '', label: '' },
        city: { key: 0, id: '', label: '' },
        address: ''
    })
}

function docsRef() {
    return [
        { key: 30, label: '30 Factura', id: 30 },
        { key: 32, label: '32 Factura de ventas y servicios no afectos o exentos de IVA' },
        { key: 33, label: '33 Factura electrónica' },
        { key: 34, label: '34 Factura no afecta o exenta electrónica' },
        { key: 35, label: '35 Boleta' },
        { key: 38, label: '38 Boleta exenta' },
        { key: 39, label: '39 Boleta electrónica' },
        { key: 40, label: '40 Liquidación factura' },
        { key: 41, label: '41 Boleta exenta electrónica' },
        { key: 43, label: '43 Liquidación factura electrónica' },
        { key: 45, label: '45 Factura de compra' },
        { key: 46, label: '46 Factura de compra electrónica' },
        { key: 48, label: '48 Pago electrónico' },
        { key: 50, label: '50 Guía de despacho' },
        { key: 52, label: '52 Guía de despacho electrónica' },
        { key: 55, label: '55 Nota de débito' },
        { key: 56, label: '56 Nota de débito electrónica' },
        { key: 60, label: '60 Nota de crédito' },
        { key: 61, label: '61 Nota de crédito electrónica' },
        { key: 103, label: '103 Liquidación' },
        { key: 110, label: '110 Factura de exportación electrónica' },
        { key: 111, label: '111 Nota de débito de exportación electrónica' },
        { key: 112, label: '112 Nota de crédito de exportación electrónica' },
        { key: 801, label: '801 Orden de compra' },
        { key: 802, label: '802 Presupuesto' },
        { key: 803, label: '803 Contrato' },
        { key: 804, label: '804 Resolución' },
        { key: 805, label: '805 Proceso ChileCompra' },
        { key: 806, label: '806 Ficha ChileCompra' },
        { key: 807, label: '807 DUS' },
        { key: 808, label: '808 B / L(conocimiento de embarque)' },
        { key: 809, label: '809 AWB(Air Will Bill)' },
        { key: 810, label: '810 MIC / DTA' },
        { key: 811, label: '811 Carta de porte' },
        { key: 812, label: '812 Resolución del SNA donde califica servicios de exportación' },
        { key: 813, label: '813 Pasaporte' },
        { key: 814, label: '814 Certificado de depósito bolsa prod.Chile' },
        { key: 815, label: '815 Vale de prenda bolsa prod.Chile' },
        { key: 914, label: '914 Declaración de ingreso(DIN)' },

    ]
}


function stamp(xml) {
    let buff = Buffer.from(xml, 'base64');
    xml = buff
    var parseString = require('xml2js').parseString; // paso de xml a json
    parseString(xml, function (err, result) {
        xml = result
    });

    let iva = xml.DTE.Documento[0].Encabezado[0].Totales[0].IVA[0]

    //--------- RUT EMISOR -----------//
    let RE = xml.DTE.Documento[0].TED[0].DD[0].RE[0]
    //--------- TIPO DOCUMENTO -----------//
    let TD = xml.DTE.Documento[0].TED[0].DD[0].TD[0]
    //--------- FOLIO -----------//
    let F = xml.DTE.Documento[0].TED[0].DD[0].F[0]
    //--------- FECHA -----------//
    let FE = xml.DTE.Documento[0].TED[0].DD[0].FE[0]
    //--------- RR -----------//
    let RR = xml.DTE.Documento[0].TED[0].DD[0].RR[0]
    //--------- RSR -----------//
    let RSR = xml.DTE.Documento[0].TED[0].DD[0].RSR[0]
    //--------- MONTO -----------//
    let MNT = xml.DTE.Documento[0].TED[0].DD[0].MNT[0]
    //--------- ITEM1 -----------//
    let IT1 = xml.DTE.Documento[0].TED[0].DD[0].IT1[0]
    //--------- TSTED -----------//
    let TSTED = xml.DTE.Documento[0].TED[0].DD[0].TSTED[0]
    //--------- CAF -----------//
    let CAF = xml.DTE.Documento[0].TED[0].DD[0].CAF[0]
    //--------- FRMT -----------//
    let FRMT = xml.DTE.Documento[0].TED[0].FRMT[0]._

    let timbre_str = '<TED version="1.0"><DD>' +
        '<RE>' + RE + '</RE>' +
        '<TD>' + TD + '</TD>' +
        '<F>' + F + '</F>' +
        '<FE>' + FE + '</FE>' +
        '<RR>' + RR + '</RR>' +
        '<RSR>' + RSR + '</RSR>' +
        '<MNT>' + MNT + '</MNT>' +
        '<IT1>' + IT1 + '</IT1>' +
        '<CAF version="1.0"><DA>' +
        '<RE>' + CAF.DA[0].RE[0] + '</RE>' +
        '<RS>' + CAF.DA[0].RS[0] + '</RS>' +
        '<TD>' + CAF.DA[0].TD[0] + '</TD>' +
        '<RNG><D>' + CAF.DA[0].RNG[0].D[0] + '</D>' +
        '<H>' + CAF.DA[0].RNG[0].H[0] + '</H></RNG>' +
        '<FA>' + CAF.DA[0].FA[0] + '</FA>' +
        '<RSAPK><M>' + CAF.DA[0].RSAPK[0].M[0] + '</M>' +
        '<E>' + CAF.DA[0].RSAPK[0].E[0] + '</E></RSAPK>' +
        '<IDK>' + CAF.DA[0].IDK[0] + '</IDK></DA>' +
        '<FRMA algoritmo="SHA1withRSA">' + CAF.FRMA[0]._ + '</FRMA></CAF>' +
        '<TSTED>' + TSTED + '</TSTED></DD>' +
        '<FRMT algoritmo="SHA1withRSA">' + FRMT + '</FRMT></TED>'

    return timbre_str
}

const comunas = [
    {
        "label": "Arica",
        "id": 1,
        "key": 1,
        "region_id": 1
    },
    {
        "label": "Camarones",
        "id": 2,
        "key": 2,
        "region_id": 1
    },
    {
        "label": "Putre",
        "id": 3,
        "key": 3,
        "region_id": 1
    },
    {
        "label": "General Lagos",
        "id": 4,
        "key": 4,
        "region_id": 1
    },
    {
        "label": "Iquique",
        "id": 5,
        "key": 5,
        "region_id": 2
    },
    {
        "label": "Alto Hospicio",
        "id": 6,
        "key": 6,
        "region_id": 2
    },
    {
        "label": "Pozo Almonte",
        "id": 7,
        "key": 7,
        "region_id": 2
    },
    {
        "label": "Camiña",
        "id": 8,
        "key": 8,
        "region_id": 2
    },
    {
        "label": "Colchane",
        "id": 9,
        "key": 9,
        "region_id": 2
    },
    {
        "label": "Huara",
        "id": 10,
        "key": 10,
        "region_id": 2
    },
    {
        "label": "Pica",
        "id": 11,
        "key": 11,
        "region_id": 2
    },
    {
        "label": "Antofagasta",
        "id": 12,
        "key": 12,
        "region_id": 3
    },
    {
        "label": "Mejillones",
        "id": 13,
        "key": 13,
        "region_id": 3
    },
    {
        "label": "Sierra Gorda",
        "id": 14,
        "key": 14,
        "region_id": 3
    },
    {
        "label": "Taltal",
        "id": 15,
        "key": 15,
        "region_id": 3
    },
    {
        "label": "Calama",
        "id": 16,
        "key": 16,
        "region_id": 3
    },
    {
        "label": "Ollagüe",
        "id": 17,
        "key": 17,
        "region_id": 3
    },
    {
        "label": "San Pedro de Atacama",
        "id": 18,
        "key": 18,
        "region_id": 3
    },
    {
        "label": "Tocopilla",
        "id": 19,
        "key": 19,
        "region_id": 3
    },
    {
        "label": "María Elena",
        "id": 20,
        "key": 20,
        "region_id": 3
    },
    {
        "label": "Copiapó",
        "id": 21,
        "key": 21,
        "region_id": 4
    },
    {
        "label": "Caldera",
        "id": 22,
        "key": 22,
        "region_id": 4
    },
    {
        "label": "Tierra Amarilla",
        "id": 23,
        "key": 23,
        "region_id": 4
    },
    {
        "label": "Chañaral",
        "id": 24,
        "key": 24,
        "region_id": 4
    },
    {
        "label": "Diego de Almagro",
        "id": 25,
        "key": 25,
        "region_id": 4
    },
    {
        "label": "Vallenar",
        "id": 26,
        "key": 26,
        "region_id": 4
    },
    {
        "label": "Alto del Carmen",
        "id": 27,
        "key": 27,
        "region_id": 4
    },
    {
        "label": "Freirina",
        "id": 28,
        "key": 28,
        "region_id": 4
    },
    {
        "label": "Huasco",
        "id": 29,
        "key": 29,
        "region_id": 4
    },
    {
        "label": "La Serena",
        "id": 30,
        "key": 30,
        "region_id": 5
    },
    {
        "label": "Coquimbo",
        "id": 31,
        "key": 31,
        "region_id": 5
    },
    {
        "label": "Andacollo",
        "id": 32,
        "key": 32,
        "region_id": 5
    },
    {
        "label": "La Higuera",
        "id": 33,
        "key": 33,
        "region_id": 5
    },
    {
        "label": "Paihuano",
        "id": 34,
        "key": 34,
        "region_id": 5
    },
    {
        "label": "Vicuña",
        "id": 35,
        "key": 35,
        "region_id": 5
    },
    {
        "label": "Illapel",
        "id": 36,
        "key": 36,
        "region_id": 5
    },
    {
        "label": "Canela",
        "id": 37,
        "key": 37,
        "region_id": 5
    },
    {
        "label": "Los Vilos",
        "id": 38,
        "key": 38,
        "region_id": 5
    },
    {
        "label": "Salamanca",
        "id": 39,
        "key": 39,
        "region_id": 5
    },
    {
        "label": "Ovalle",
        "id": 40,
        "key": 40,
        "region_id": 5
    },
    {
        "label": "Combarbalá",
        "id": 41,
        "key": 41,
        "region_id": 5
    },
    {
        "label": "Monte Patria",
        "id": 42,
        "key": 42,
        "region_id": 5
    },
    {
        "label": "Punitaqui",
        "id": 43,
        "key": 43,
        "region_id": 5
    },
    {
        "label": "Río Hurtado",
        "id": 44,
        "key": 44,
        "region_id": 5
    },
    {
        "label": "Valparaíso",
        "id": 45,
        "key": 45,
        "region_id": 6
    },
    {
        "label": "Casablanca",
        "id": 46,
        "key": 46,
        "region_id": 6
    },
    {
        "label": "Concón",
        "id": 47,
        "key": 47,
        "region_id": 6
    },
    {
        "label": "Juan Fernández",
        "id": 48,
        "key": 48,
        "region_id": 6
    },
    {
        "label": "Puchuncaví",
        "id": 49,
        "key": 49,
        "region_id": 6
    },
    {
        "label": "Quintero",
        "id": 50,
        "key": 50,
        "region_id": 6
    },
    {
        "label": "Viña del Mar",
        "id": 51,
        "key": 51,
        "region_id": 6
    },
    {
        "label": "Isla de Pascua",
        "id": 52,
        "key": 52,
        "region_id": 6
    },
    {
        "label": "Los Andes",
        "id": 53,
        "key": 53,
        "region_id": 6
    },
    {
        "label": "Calle Larga",
        "id": 54,
        "key": 54,
        "region_id": 6
    },
    {
        "label": "Rinconada",
        "id": 55,
        "key": 55,
        "region_id": 6
    },
    {
        "label": "San Esteban",
        "id": 56,
        "key": 56,
        "region_id": 6
    },
    {
        "label": "La Ligua",
        "id": 57,
        "key": 57,
        "region_id": 6
    },
    {
        "label": "Cabildo",
        "id": 58,
        "key": 58,
        "region_id": 6
    },
    {
        "label": "Papudo",
        "id": 59,
        "key": 59,
        "region_id": 6
    },
    {
        "label": "Petorca",
        "id": 60,
        "key": 60,
        "region_id": 6
    },
    {
        "label": "Zapallar",
        "id": 61,
        "key": 61,
        "region_id": 6
    },
    {
        "label": "Quillota",
        "id": 62,
        "key": 62,
        "region_id": 6
    },
    {
        "label": "La Calera",
        "id": 63,
        "key": 63,
        "region_id": 6
    },
    {
        "label": "Hijuelas",
        "id": 64,
        "key": 64,
        "region_id": 6
    },
    {
        "label": "La Cruz",
        "id": 65,
        "key": 65,
        "region_id": 6
    },
    {
        "label": "Nogales",
        "id": 66,
        "key": 66,
        "region_id": 6
    },
    {
        "label": "San Antonio",
        "id": 67,
        "key": 67,
        "region_id": 6
    },
    {
        "label": "Algarrobo",
        "id": 68,
        "key": 68,
        "region_id": 6
    },
    {
        "label": "Cartagena",
        "id": 69,
        "key": 69,
        "region_id": 6
    },
    {
        "label": "El Quisco",
        "id": 70,
        "key": 70,
        "region_id": 6
    },
    {
        "label": "El Tabo",
        "id": 71,
        "key": 71,
        "region_id": 6
    },
    {
        "label": "Santo Domingo",
        "id": 72,
        "key": 72,
        "region_id": 6
    },
    {
        "label": "San Felipe",
        "id": 73,
        "key": 73,
        "region_id": 6
    },
    {
        "label": "Catemu",
        "id": 74,
        "key": 74,
        "region_id": 6
    },
    {
        "label": "Llaillay",
        "id": 75,
        "key": 75,
        "region_id": 6
    },
    {
        "label": "Panquehue",
        "id": 76,
        "key": 76,
        "region_id": 6
    },
    {
        "label": "Putaendo",
        "id": 77,
        "key": 77,
        "region_id": 6
    },
    {
        "label": "Santa María",
        "id": 78,
        "key": 78,
        "region_id": 6
    },
    {
        "label": "Quilpué",
        "id": 79,
        "key": 79,
        "region_id": 6
    },
    {
        "label": "Limache",
        "id": 80,
        "key": 80,
        "region_id": 6
    },
    {
        "label": "Olmué",
        "id": 81,
        "key": 81,
        "region_id": 6
    },
    {
        "label": "Villa Alemana",
        "id": 82,
        "key": 82,
        "region_id": 6
    },
    {
        "label": "Rancagua",
        "id": 83,
        "key": 83,
        "region_id": 7
    },
    {
        "label": "Codegua",
        "id": 84,
        "key": 84,
        "region_id": 7
    },
    {
        "label": "Coinco",
        "id": 85,
        "key": 85,
        "region_id": 7
    },
    {
        "label": "Coltauco",
        "id": 86,
        "key": 86,
        "region_id": 7
    },
    {
        "label": "Doñihue",
        "id": 87,
        "key": 87,
        "region_id": 7
    },
    {
        "label": "Graneros",
        "id": 88,
        "key": 88,
        "region_id": 7
    },
    {
        "label": "Las Cabras",
        "id": 89,
        "key": 89,
        "region_id": 7
    },
    {
        "label": "Machalí",
        "id": 90,
        "key": 90,
        "region_id": 7
    },
    {
        "label": "Malloa",
        "id": 91,
        "key": 91,
        "region_id": 7
    },
    {
        "label": "Mostazal",
        "id": 92,
        "key": 92,
        "region_id": 7
    },
    {
        "label": "Olivar",
        "id": 93,
        "key": 93,
        "region_id": 7
    },
    {
        "label": "Peumo",
        "id": 94,
        "key": 94,
        "region_id": 7
    },
    {
        "label": "Pichidegua",
        "id": 95,
        "key": 95,
        "region_id": 7
    },
    {
        "label": "Quinta de Tilcoco",
        "id": 96,
        "key": 96,
        "region_id": 7
    },
    {
        "label": "Rengo",
        "id": 97,
        "key": 97,
        "region_id": 7
    },
    {
        "label": "Requínoa",
        "id": 98,
        "key": 98,
        "region_id": 7
    },
    {
        "label": "San Vicente",
        "id": 99,
        "key": 99,
        "region_id": 7
    },
    {
        "label": "Pichilemu",
        "id": 100,
        "key": 100,
        "region_id": 7
    },
    {
        "label": "La Estrella",
        "id": 101,
        "key": 101,
        "region_id": 7
    },
    {
        "label": "Litueche",
        "id": 102,
        "key": 102,
        "region_id": 7
    },
    {
        "label": "Marchihue",
        "id": 103,
        "key": 103,
        "region_id": 7
    },
    {
        "label": "Navidad",
        "id": 104,
        "key": 104,
        "region_id": 7
    },
    {
        "label": "Paredones",
        "id": 105,
        "key": 105,
        "region_id": 7
    },
    {
        "label": "San Fernando",
        "id": 106,
        "key": 106,
        "region_id": 7
    },
    {
        "label": "Chépica",
        "id": 107,
        "key": 107,
        "region_id": 7
    },
    {
        "label": "Chimbarongo",
        "id": 108,
        "key": 108,
        "region_id": 7
    },
    {
        "label": "Lolol",
        "id": 109,
        "key": 109,
        "region_id": 7
    },
    {
        "label": "Nancagua",
        "id": 110,
        "key": 110,
        "region_id": 7
    },
    {
        "label": "Palmilla",
        "id": 111,
        "key": 111,
        "region_id": 7
    },
    {
        "label": "Peralillo",
        "id": 112,
        "key": 112,
        "region_id": 7
    },
    {
        "label": "Placilla",
        "id": 113,
        "key": 113,
        "region_id": 7
    },
    {
        "label": "Pumanque",
        "id": 114,
        "key": 114,
        "region_id": 7
    },
    {
        "label": "Santa Cruz",
        "id": 115,
        "key": 115,
        "region_id": 7
    },
    {
        "label": "Talca",
        "id": 116,
        "key": 116,
        "region_id": 8
    },
    {
        "label": "Constitución",
        "id": 117,
        "key": 117,
        "region_id": 8
    },
    {
        "label": "Curepto",
        "id": 118,
        "key": 118,
        "region_id": 8
    },
    {
        "label": "Empedrado",
        "id": 119,
        "key": 119,
        "region_id": 8
    },
    {
        "label": "Maule",
        "id": 120,
        "key": 120,
        "region_id": 8
    },
    {
        "label": "Pelarco",
        "id": 121,
        "key": 121,
        "region_id": 8
    },
    {
        "label": "Pencahue",
        "id": 122,
        "key": 122,
        "region_id": 8
    },
    {
        "label": "Río Claro",
        "id": 123,
        "key": 123,
        "region_id": 8
    },
    {
        "label": "San Clemente",
        "id": 124,
        "key": 124,
        "region_id": 8
    },
    {
        "label": "San Rafael",
        "id": 125,
        "key": 125,
        "region_id": 8
    },
    {
        "label": "Cauquenes",
        "id": 126,
        "key": 126,
        "region_id": 8
    },
    {
        "label": "Chanco",
        "id": 127,
        "key": 127,
        "region_id": 8
    },
    {
        "label": "Pelluhue",
        "id": 128,
        "key": 128,
        "region_id": 8
    },
    {
        "label": "Curicó",
        "id": 129,
        "key": 129,
        "region_id": 8
    },
    {
        "label": "Hualañé",
        "id": 130,
        "key": 130,
        "region_id": 8
    },
    {
        "label": "Licantén",
        "id": 131,
        "key": 131,
        "region_id": 8
    },
    {
        "label": "Molina",
        "id": 132,
        "key": 132,
        "region_id": 8
    },
    {
        "label": "Rauco",
        "id": 133,
        "key": 133,
        "region_id": 8
    },
    {
        "label": "Romeral",
        "id": 134,
        "key": 134,
        "region_id": 8
    },
    {
        "label": "Sagrada Familia",
        "id": 135,
        "key": 135,
        "region_id": 8
    },
    {
        "label": "Teno",
        "id": 136,
        "key": 136,
        "region_id": 8
    },
    {
        "label": "Vichuquén",
        "id": 137,
        "key": 137,
        "region_id": 8
    },
    {
        "label": "Linares",
        "id": 138,
        "key": 138,
        "region_id": 8
    },
    {
        "label": "Colbún",
        "id": 139,
        "key": 139,
        "region_id": 8
    },
    {
        "label": "Longaví",
        "id": 140,
        "key": 140,
        "region_id": 8
    },
    {
        "label": "Parral",
        "id": 141,
        "key": 141,
        "region_id": 8
    },
    {
        "label": "Retiro",
        "id": 142,
        "key": 142,
        "region_id": 8
    },
    {
        "label": "San Javier",
        "id": 143,
        "key": 143,
        "region_id": 8
    },
    {
        "label": "Villa Alegre",
        "id": 144,
        "key": 144,
        "region_id": 8
    },
    {
        "label": "Yerbas Buenas",
        "id": 145,
        "key": 145,
        "region_id": 8
    },
    {
        "label": "Concepción",
        "id": 146,
        "key": 146,
        "region_id": 9
    },
    {
        "label": "Coronel",
        "id": 147,
        "key": 147,
        "region_id": 9
    },
    {
        "label": "Chiguayante",
        "id": 148,
        "key": 148,
        "region_id": 9
    },
    {
        "label": "Florida",
        "id": 149,
        "key": 149,
        "region_id": 9
    },
    {
        "label": "Hualqui",
        "id": 150,
        "key": 150,
        "region_id": 9
    },
    {
        "label": "Lota",
        "id": 151,
        "key": 151,
        "region_id": 9
    },
    {
        "label": "Penco",
        "id": 152,
        "key": 152,
        "region_id": 9
    },
    {
        "label": "San Pedro de La Paz",
        "id": 153,
        "key": 153,
        "region_id": 9
    },
    {
        "label": "Santa Juana",
        "id": 154,
        "key": 154,
        "region_id": 9
    },
    {
        "label": "Talcahuano",
        "id": 155,
        "key": 155,
        "region_id": 9
    },
    {
        "label": "Tomé",
        "id": 156,
        "key": 156,
        "region_id": 9
    },
    {
        "label": "Hualpén",
        "id": 157,
        "key": 157,
        "region_id": 9
    },
    {
        "label": "Lebu",
        "id": 158,
        "key": 158,
        "region_id": 9
    },
    {
        "label": "Arauco",
        "id": 159,
        "key": 159,
        "region_id": 9
    },
    {
        "label": "Cañete",
        "id": 160,
        "key": 160,
        "region_id": 9
    },
    {
        "label": "Contulmo",
        "id": 161,
        "key": 161,
        "region_id": 9
    },
    {
        "label": "Curanilahue",
        "id": 162,
        "key": 162,
        "region_id": 9
    },
    {
        "label": "Los Álamos",
        "id": 163,
        "key": 163,
        "region_id": 9
    },
    {
        "label": "Tirúa",
        "id": 164,
        "key": 164,
        "region_id": 9
    },
    {
        "label": "Los Ángeles",
        "id": 165,
        "key": 165,
        "region_id": 9
    },
    {
        "label": "Antuco",
        "id": 166,
        "key": 166,
        "region_id": 9
    },
    {
        "label": "Cabrero",
        "id": 167,
        "key": 167,
        "region_id": 9
    },
    {
        "label": "Laja",
        "id": 168,
        "key": 168,
        "region_id": 9
    },
    {
        "label": "Mulchén",
        "id": 169,
        "key": 169,
        "region_id": 9
    },
    {
        "label": "Nacimiento",
        "id": 170,
        "key": 170,
        "region_id": 9
    },
    {
        "label": "Negrete",
        "id": 171,
        "key": 171,
        "region_id": 9
    },
    {
        "label": "Quilaco",
        "id": 172,
        "key": 172,
        "region_id": 9
    },
    {
        "label": "Quilleco",
        "id": 173,
        "key": 173,
        "region_id": 9
    },
    {
        "label": "San Rosendo",
        "id": 174,
        "key": 174,
        "region_id": 9
    },
    {
        "label": "Santa Bárbara",
        "id": 175,
        "key": 175,
        "region_id": 9
    },
    {
        "label": "Tucapel",
        "id": 176,
        "key": 176,
        "region_id": 9
    },
    {
        "label": "Yumbel",
        "id": 177,
        "key": 177,
        "region_id": 9
    },
    {
        "label": "Alto Biobío",
        "id": 178,
        "key": 178,
        "region_id": 9
    },
    {
        "label": "Temuco",
        "id": 200,
        "key": 200,
        "region_id": 10
    },
    {
        "label": "Carahue",
        "id": 201,
        "key": 201,
        "region_id": 10
    },
    {
        "label": "Cunco",
        "id": 202,
        "key": 202,
        "region_id": 10
    },
    {
        "label": "Curarrehue",
        "id": 203,
        "key": 203,
        "region_id": 10
    },
    {
        "label": "Freire",
        "id": 204,
        "key": 204,
        "region_id": 10
    },
    {
        "label": "Galvarino",
        "id": 205,
        "key": 205,
        "region_id": 10
    },
    {
        "label": "Gorbea",
        "id": 206,
        "key": 206,
        "region_id": 10
    },
    {
        "label": "Lautaro",
        "id": 207,
        "key": 207,
        "region_id": 10
    },
    {
        "label": "Loncoche",
        "id": 208,
        "key": 208,
        "region_id": 10
    },
    {
        "label": "Melipeuco",
        "id": 209,
        "key": 209,
        "region_id": 10
    },
    {
        "label": "Nueva Imperial",
        "id": 210,
        "key": 210,
        "region_id": 10
    },
    {
        "label": "Padre Las Casas",
        "id": 211,
        "key": 211,
        "region_id": 10
    },
    {
        "label": "Perquenco",
        "id": 212,
        "key": 212,
        "region_id": 10
    },
    {
        "label": "Pitrufquén",
        "id": 213,
        "key": 213,
        "region_id": 10
    },
    {
        "label": "Pucón",
        "id": 214,
        "key": 214,
        "region_id": 10
    },
    {
        "label": "Saavedra",
        "id": 215,
        "key": 215,
        "region_id": 10
    },
    {
        "label": "Teodoro Schmidt",
        "id": 216,
        "key": 216,
        "region_id": 10
    },
    {
        "label": "Toltén",
        "id": 217,
        "key": 217,
        "region_id": 10
    },
    {
        "label": "Vilcún",
        "id": 218,
        "key": 218,
        "region_id": 10
    },
    {
        "label": "Villarrica",
        "id": 219,
        "key": 219,
        "region_id": 10
    },
    {
        "label": "Cholchol",
        "id": 220,
        "key": 220,
        "region_id": 10
    },
    {
        "label": "Angol",
        "id": 221,
        "key": 221,
        "region_id": 10
    },
    {
        "label": "Collipulli",
        "id": 222,
        "key": 222,
        "region_id": 10
    },
    {
        "label": "Curacautín",
        "id": 223,
        "key": 223,
        "region_id": 10
    },
    {
        "label": "Ercilla",
        "id": 224,
        "key": 224,
        "region_id": 10
    },
    {
        "label": "Lonquimay",
        "id": 225,
        "key": 225,
        "region_id": 10
    },
    {
        "label": "Los Sauces",
        "id": 226,
        "key": 226,
        "region_id": 10
    },
    {
        "label": "Lumaco",
        "id": 227,
        "key": 227,
        "region_id": 10
    },
    {
        "label": "Purén",
        "id": 228,
        "key": 228,
        "region_id": 10
    },
    {
        "label": "Renaico",
        "id": 229,
        "key": 229,
        "region_id": 10
    },
    {
        "label": "Traiguén",
        "id": 230,
        "key": 230,
        "region_id": 10
    },
    {
        "label": "Victoria",
        "id": 231,
        "key": 231,
        "region_id": 10
    },
    {
        "label": "Valdivia",
        "id": 232,
        "key": 232,
        "region_id": 11
    },
    {
        "label": "Corral",
        "id": 233,
        "key": 233,
        "region_id": 11
    },
    {
        "label": "Lanco",
        "id": 234,
        "key": 234,
        "region_id": 11
    },
    {
        "label": "Los Lagos",
        "id": 235,
        "key": 235,
        "region_id": 11
    },
    {
        "label": "Máfil",
        "id": 236,
        "key": 236,
        "region_id": 11
    },
    {
        "label": "Mariquina",
        "id": 237,
        "key": 237,
        "region_id": 11
    },
    {
        "label": "Paillaco",
        "id": 238,
        "key": 238,
        "region_id": 11
    },
    {
        "label": "Panguipulli",
        "id": 239,
        "key": 239,
        "region_id": 11
    },
    {
        "label": "La Unión",
        "id": 240,
        "key": 240,
        "region_id": 11
    },
    {
        "label": "Futrono",
        "id": 241,
        "key": 241,
        "region_id": 11
    },
    {
        "label": "Lago Ranco",
        "id": 242,
        "key": 242,
        "region_id": 11
    },
    {
        "label": "Río Bueno",
        "id": 243,
        "key": 243,
        "region_id": 11
    },
    {
        "label": "Puerto Montt",
        "id": 244,
        "key": 244,
        "region_id": 12
    },
    {
        "label": "Calbuco",
        "id": 245,
        "key": 245,
        "region_id": 12
    },
    {
        "label": "Cochamó",
        "id": 246,
        "key": 246,
        "region_id": 12
    },
    {
        "label": "Fresia",
        "id": 247,
        "key": 247,
        "region_id": 12
    },
    {
        "label": "Frutillar",
        "id": 248,
        "key": 248,
        "region_id": 12
    },
    {
        "label": "Los Muermos",
        "id": 249,
        "key": 249,
        "region_id": 12
    },
    {
        "label": "Llanquihue",
        "id": 250,
        "key": 250,
        "region_id": 12
    },
    {
        "label": "Maullín",
        "id": 251,
        "key": 251,
        "region_id": 12
    },
    {
        "label": "Puerto Varas",
        "id": 252,
        "key": 252,
        "region_id": 12
    },
    {
        "label": "Castro",
        "id": 253,
        "key": 253,
        "region_id": 12
    },
    {
        "label": "Ancud",
        "id": 254,
        "key": 254,
        "region_id": 12
    },
    {
        "label": "Chonchi",
        "id": 255,
        "key": 255,
        "region_id": 12
    },
    {
        "label": "Curaco de Vélez",
        "id": 256,
        "key": 256,
        "region_id": 12
    },
    {
        "label": "Dalcahue",
        "id": 257,
        "key": 257,
        "region_id": 12
    },
    {
        "label": "Puqueldón",
        "id": 258,
        "key": 258,
        "region_id": 12
    },
    {
        "label": "Queilén",
        "id": 259,
        "key": 259,
        "region_id": 12
    },
    {
        "label": "Quellón",
        "id": 260,
        "key": 260,
        "region_id": 12
    },
    {
        "label": "Quemchi",
        "id": 261,
        "key": 261,
        "region_id": 12
    },
    {
        "label": "Quinchao",
        "id": 262,
        "key": 262,
        "region_id": 12
    },
    {
        "label": "Osorno",
        "id": 263,
        "key": 263,
        "region_id": 12
    },
    {
        "label": "Puerto Octay",
        "id": 264,
        "key": 264,
        "region_id": 12
    },
    {
        "label": "Purranque",
        "id": 265,
        "key": 265,
        "region_id": 12
    },
    {
        "label": "Puyehue",
        "id": 266,
        "key": 266,
        "region_id": 12
    },
    {
        "label": "Río Negro",
        "id": 267,
        "key": 267,
        "region_id": 12
    },
    {
        "label": "San Juan de la Costa",
        "id": 268,
        "key": 268,
        "region_id": 12
    },
    {
        "label": "San Pablo",
        "id": 269,
        "key": 269,
        "region_id": 12
    },
    {
        "label": "Chaitén",
        "id": 270,
        "key": 270,
        "region_id": 12
    },
    {
        "label": "Futaleufú",
        "id": 271,
        "key": 271,
        "region_id": 12
    },
    {
        "label": "Hualaihué",
        "id": 272,
        "key": 272,
        "region_id": 12
    },
    {
        "label": "Palena",
        "id": 273,
        "key": 273,
        "region_id": 12
    },
    {
        "label": "Coyhaique",
        "id": 274,
        "key": 274,
        "region_id": 13
    },
    {
        "label": "Lago Verde",
        "id": 275,
        "key": 275,
        "region_id": 13
    },
    {
        "label": "Aysén",
        "id": 276,
        "key": 276,
        "region_id": 13
    },
    {
        "label": "Cisnes",
        "id": 277,
        "key": 277,
        "region_id": 13
    },
    {
        "label": "Guaitecas",
        "id": 278,
        "key": 278,
        "region_id": 13
    },
    {
        "label": "Cochrane",
        "id": 279,
        "key": 279,
        "region_id": 13
    },
    {
        "label": "O'Higgins",
        "id": 280,
        "key": 280,
        "region_id": 13
    },
    {
        "label": "Tortel",
        "id": 281,
        "key": 281,
        "region_id": 13
    },
    {
        "label": "Chile Chico",
        "id": 282,
        "key": 282,
        "region_id": 13
    },
    {
        "label": "Río Ibáñez",
        "id": 283,
        "key": 283,
        "region_id": 13
    },
    {
        "label": "Punta Arenas",
        "id": 284,
        "key": 284,
        "region_id": 14
    },
    {
        "label": "Laguna Blanca",
        "id": 285,
        "key": 285,
        "region_id": 14
    },
    {
        "label": "Río Verde",
        "id": 286,
        "key": 286,
        "region_id": 14
    },
    {
        "label": "San Gregorio",
        "id": 287,
        "key": 287,
        "region_id": 14
    },
    {
        "label": "Cabo de Hornos",
        "id": 288,
        "key": 288,
        "region_id": 14
    },
    {
        "label": "Antártica",
        "id": 289,
        "key": 289,
        "region_id": 14
    },
    {
        "label": "Porvenir",
        "id": 290,
        "key": 290,
        "region_id": 14
    },
    {
        "label": "Primavera",
        "id": 291,
        "key": 291,
        "region_id": 14
    },
    {
        "label": "Timaukel",
        "id": 292,
        "key": 292,
        "region_id": 14
    },
    {
        "label": "Natales",
        "id": 293,
        "key": 293,
        "region_id": 14
    },
    {
        "label": "Torres del Paine",
        "id": 294,
        "key": 294,
        "region_id": 14
    },
    {
        "label": "Santiago",
        "id": 295,
        "key": 295,
        "region_id": 15
    },
    {
        "label": "Cerrillos",
        "id": 296,
        "key": 296,
        "region_id": 15
    },
    {
        "label": "Cerro Navia",
        "id": 297,
        "key": 297,
        "region_id": 15
    },
    {
        "label": "Conchalí",
        "id": 298,
        "key": 298,
        "region_id": 15
    },
    {
        "label": "El Bosque",
        "id": 299,
        "key": 299,
        "region_id": 15
    },
    {
        "label": "Estación Central",
        "id": 300,
        "key": 300,
        "region_id": 15
    },
    {
        "label": "Huechuraba",
        "id": 301,
        "key": 301,
        "region_id": 15
    },
    {
        "label": "Independencia",
        "id": 302,
        "key": 302,
        "region_id": 15
    },
    {
        "label": "La Cisterna",
        "id": 303,
        "key": 303,
        "region_id": 15
    },
    {
        "label": "La Florida",
        "id": 304,
        "key": 304,
        "region_id": 15
    },
    {
        "label": "La Granja",
        "id": 305,
        "key": 305,
        "region_id": 15
    },
    {
        "label": "La Pintana",
        "id": 306,
        "key": 306,
        "region_id": 15
    },
    {
        "label": "La Reina",
        "id": 307,
        "key": 307,
        "region_id": 15
    },
    {
        "label": "Las Condes",
        "id": 308,
        "key": 308,
        "region_id": 15
    },
    {
        "label": "Lo Barnechea",
        "id": 309,
        "key": 309,
        "region_id": 15
    },
    {
        "label": "Lo Espejo",
        "id": 310,
        "key": 310,
        "region_id": 15
    },
    {
        "label": "Lo Prado",
        "id": 311,
        "key": 311,
        "region_id": 15
    },
    {
        "label": "Macul",
        "id": 312,
        "key": 312,
        "region_id": 15
    },
    {
        "label": "Maipú",
        "id": 313,
        "key": 313,
        "region_id": 15
    },
    {
        "label": "Ñuñoa",
        "id": 314,
        "key": 314,
        "region_id": 15
    },
    {
        "label": "Pedro Aguirre Cerda",
        "id": 315,
        "key": 315,
        "region_id": 15
    },
    {
        "label": "Peñalolén",
        "id": 316,
        "key": 316,
        "region_id": 15
    },
    {
        "label": "Providencia",
        "id": 317,
        "key": 317,
        "region_id": 15
    },
    {
        "label": "Pudahuel",
        "id": 318,
        "key": 318,
        "region_id": 15
    },
    {
        "label": "Quilicura",
        "id": 319,
        "key": 319,
        "region_id": 15
    },
    {
        "label": "Quinta Normal",
        "id": 320,
        "key": 320,
        "region_id": 15
    },
    {
        "label": "Recoleta",
        "id": 321,
        "key": 321,
        "region_id": 15
    },
    {
        "label": "Renca",
        "id": 322,
        "key": 322,
        "region_id": 15
    },
    {
        "label": "San Joaquín",
        "id": 323,
        "key": 323,
        "region_id": 15
    },
    {
        "label": "San Miguel",
        "id": 324,
        "key": 324,
        "region_id": 15
    },
    {
        "label": "San Ramón",
        "id": 325,
        "key": 325,
        "region_id": 15
    },
    {
        "label": "Vitacura",
        "id": 326,
        "key": 326,
        "region_id": 15
    },
    {
        "label": "Puente Alto",
        "id": 327,
        "key": 327,
        "region_id": 15
    },
    {
        "label": "Pirque",
        "id": 328,
        "key": 328,
        "region_id": 15
    },
    {
        "label": "San José de Maipo",
        "id": 329,
        "key": 329,
        "region_id": 15
    },
    {
        "label": "Colina",
        "id": 330,
        "key": 330,
        "region_id": 15
    },
    {
        "label": "Lampa",
        "id": 331,
        "key": 331,
        "region_id": 15
    },
    {
        "label": "Til Til",
        "id": 332,
        "key": 332,
        "region_id": 15
    },
    {
        "label": "San Bernardo",
        "id": 333,
        "key": 333,
        "region_id": 15
    },
    {
        "label": "Buin",
        "id": 334,
        "key": 334,
        "region_id": 15
    },
    {
        "label": "Calera de Tango",
        "id": 335,
        "key": 335,
        "region_id": 15
    },
    {
        "label": "Paine",
        "id": 336,
        "key": 336,
        "region_id": 15
    },
    {
        "label": "Melipilla",
        "id": 337,
        "key": 337,
        "region_id": 15
    },
    {
        "label": "Alhué",
        "id": 338,
        "key": 338,
        "region_id": 15
    },
    {
        "label": "Curacaví",
        "id": 339,
        "key": 339,
        "region_id": 15
    },
    {
        "label": "María Pinto",
        "id": 340,
        "key": 340,
        "region_id": 15
    },
    {
        "label": "San Pedro",
        "id": 341,
        "key": 341,
        "region_id": 15
    },
    {
        "label": "Talagante",
        "id": 342,
        "key": 342,
        "region_id": 15
    },
    {
        "label": "El Monte",
        "id": 343,
        "key": 343,
        "region_id": 15
    },
    {
        "label": "Isla de Maipo",
        "id": 344,
        "key": 344,
        "region_id": 15
    },
    {
        "label": "Padre Hurtado",
        "id": 345,
        "key": 345,
        "region_id": 15
    },
    {
        "label": "Peñaflor",
        "id": 346,
        "key": 346,
        "region_id": 15
    },
    {
        "label": "Chillán",
        "id": 179,
        "key": 179,
        "region_id": 27
    },
    {
        "label": "Bulnes",
        "id": 180,
        "key": 180,
        "region_id": 27
    },
    {
        "label": "Chillán Viejo",
        "id": 184,
        "key": 184,
        "region_id": 27
    },
    {
        "label": "El Carmen",
        "id": 185,
        "key": 185,
        "region_id": 27
    },
    {
        "label": "Pemuco",
        "id": 188,
        "key": 188,
        "region_id": 27
    },
    {
        "label": "Pinto",
        "id": 189,
        "key": 189,
        "region_id": 27
    },
    {
        "label": "Quillón",
        "id": 191,
        "key": 191,
        "region_id": 27
    },
    {
        "label": "San Ignacio",
        "id": 196,
        "key": 196,
        "region_id": 27
    },
    {
        "label": "Yungay",
        "id": 199,
        "key": 199,
        "region_id": 27
    },
    {
        "label": "Cobquecura",
        "id": 181,
        "key": 181,
        "region_id": 27
    },
    {
        "label": "Coelemu",
        "id": 182,
        "key": 182,
        "region_id": 27
    },
    {
        "label": "Ninhue",
        "id": 186,
        "key": 186,
        "region_id": 27
    },
    {
        "label": "Portezuelo",
        "id": 190,
        "key": 190,
        "region_id": 27
    },
    {
        "label": "Quirihue",
        "id": 192,
        "key": 192,
        "region_id": 27
    },
    {
        "label": "Ránquil",
        "id": 193,
        "key": 193,
        "region_id": 27
    },
    {
        "label": "Treguaco",
        "id": 198,
        "key": 198,
        "region_id": 27
    },
    {
        "label": "Coihueco",
        "id": 183,
        "key": 183,
        "region_id": 27
    },
    {
        "label": "Ñiquén",
        "id": 187,
        "key": 187,
        "region_id": 27
    },
    {
        "label": "San Carlos",
        "id": 194,
        "key": 194,
        "region_id": 27
    },
    {
        "label": "San Fabián",
        "id": 195,
        "key": 195,
        "region_id": 27
    },
    {
        "label": "San Nicolás",
        "id": 197,
        "key": 197,
        "region_id": 27
    }
]

const ciudades = [
    {
        "label": "Arica",
        "id": 1,
        "key": 1,
        "region_id": 1
    },
    {
        "label": "Iquique",
        "id": 2,
        "key": 2,
        "region_id": 2
    },
    {
        "label": "Alto Hospicio",
        "id": 3,
        "key": 3,
        "region_id": 2
    },
    {
        "label": "Pozo Almonte",
        "id": 4,
        "key": 4,
        "region_id": 2
    },
    {
        "label": "Antofagasta",
        "id": 5,
        "key": 5,
        "region_id": 3
    },
    {
        "label": "Calama",
        "id": 6,
        "key": 6,
        "region_id": 3
    },
    {
        "label": "Tocopilla",
        "id": 7,
        "key": 7,
        "region_id": 3
    },
    {
        "label": "Taltal",
        "id": 8,
        "key": 8,
        "region_id": 3
    },
    {
        "label": "Mejillones",
        "id": 9,
        "key": 9,
        "region_id": 3
    },
    {
        "label": "María Elena",
        "id": 10,
        "key": 10,
        "region_id": 3
    },
    {
        "label": "Copiapó",
        "id": 11,
        "key": 11,
        "region_id": 4
    },
    {
        "label": "Caldera",
        "id": 12,
        "key": 12,
        "region_id": 4
    },
    {
        "label": "Tierra Amarilla",
        "id": 13,
        "key": 13,
        "region_id": 4
    },
    {
        "label": "Chañaral",
        "id": 14,
        "key": 14,
        "region_id": 4
    },
    {
        "label": "Diego de Almagro",
        "id": 15,
        "key": 15,
        "region_id": 4
    },
    {
        "label": "El Salvador",
        "id": 16,
        "key": 16,
        "region_id": 4
    },
    {
        "label": "Vallenar",
        "id": 17,
        "key": 17,
        "region_id": 4
    },
    {
        "label": "Huasco",
        "id": 18,
        "key": 18,
        "region_id": 4
    },
    {
        "label": "La Serena",
        "id": 19,
        "key": 19,
        "region_id": 5
    },
    {
        "label": "Coquimbo",
        "id": 20,
        "key": 20,
        "region_id": 5
    },
    {
        "label": "Andacollo",
        "id": 21,
        "key": 21,
        "region_id": 5
    },
    {
        "label": "Vicuña",
        "id": 22,
        "key": 22,
        "region_id": 5
    },
    {
        "label": "Illapel",
        "id": 23,
        "key": 23,
        "region_id": 5
    },
    {
        "label": "Los Vilos",
        "id": 24,
        "key": 24,
        "region_id": 5
    },
    {
        "label": "Salamanca",
        "id": 25,
        "key": 25,
        "region_id": 5
    },
    {
        "label": "Ovalle",
        "id": 26,
        "key": 26,
        "region_id": 5
    },
    {
        "label": "Combarbalá",
        "id": 27,
        "key": 27,
        "region_id": 5
    },
    {
        "label": "Monte Patria",
        "id": 28,
        "key": 28,
        "region_id": 5
    },
    {
        "label": "Valparaíso",
        "id": 29,
        "key": 29,
        "region_id": 6
    },
    {
        "label": "Concón",
        "id": 30,
        "key": 30,
        "region_id": 6
    },
    {
        "label": "Viña del Mar",
        "id": 31,
        "key": 31,
        "region_id": 6
    },
    {
        "label": "Villa Alemana",
        "id": 32,
        "key": 32,
        "region_id": 6
    },
    {
        "label": "Quilpué",
        "id": 33,
        "key": 33,
        "region_id": 6
    },
    {
        "label": "Placilla de Peñuelas",
        "id": 34,
        "key": 34,
        "region_id": 6
    },
    {
        "label": "San Antonio",
        "id": 35,
        "key": 35,
        "region_id": 6
    },
    {
        "label": "Santo Domingo",
        "id": 36,
        "key": 36,
        "region_id": 6
    },
    {
        "label": "Cartagena",
        "id": 37,
        "key": 37,
        "region_id": 6
    },
    {
        "label": "Quillota",
        "id": 38,
        "key": 38,
        "region_id": 6
    },
    {
        "label": "Hijuelas",
        "id": 39,
        "key": 39,
        "region_id": 6
    },
    {
        "label": "La Calera",
        "id": 40,
        "key": 40,
        "region_id": 6
    },
    {
        "label": "La Cruz",
        "id": 41,
        "key": 41,
        "region_id": 6
    },
    {
        "label": "San Felipe",
        "id": 42,
        "key": 42,
        "region_id": 6
    },
    {
        "label": "Casablanca",
        "id": 43,
        "key": 43,
        "region_id": 6
    },
    {
        "label": "Las Ventanas",
        "id": 44,
        "key": 44,
        "region_id": 6
    },
    {
        "label": "Quintero",
        "id": 45,
        "key": 45,
        "region_id": 6
    },
    {
        "label": "Los Andes",
        "id": 46,
        "key": 46,
        "region_id": 6
    },
    {
        "label": "Calle Larga",
        "id": 47,
        "key": 47,
        "region_id": 6
    },
    {
        "label": "Rinconada",
        "id": 48,
        "key": 48,
        "region_id": 6
    },
    {
        "label": "San Esteban",
        "id": 49,
        "key": 49,
        "region_id": 6
    },
    {
        "label": "La Ligua",
        "id": 50,
        "key": 50,
        "region_id": 6
    },
    {
        "label": "Cabildo",
        "id": 51,
        "key": 51,
        "region_id": 6
    },
    {
        "label": "Limache",
        "id": 52,
        "key": 52,
        "region_id": 6
    },
    {
        "label": "Nogales",
        "id": 53,
        "key": 53,
        "region_id": 6
    },
    {
        "label": "El Melón",
        "id": 54,
        "key": 54,
        "region_id": 6
    },
    {
        "label": "Olmué",
        "id": 55,
        "key": 55,
        "region_id": 6
    },
    {
        "label": "Algarrobo",
        "id": 56,
        "key": 56,
        "region_id": 6
    },
    {
        "label": "El Quisco",
        "id": 57,
        "key": 57,
        "region_id": 6
    },
    {
        "label": "El Tabo",
        "id": 58,
        "key": 58,
        "region_id": 6
    },
    {
        "label": "Catemu",
        "id": 59,
        "key": 59,
        "region_id": 6
    },
    {
        "label": "Llaillay",
        "id": 60,
        "key": 60,
        "region_id": 6
    },
    {
        "label": "Putaendo",
        "id": 61,
        "key": 61,
        "region_id": 6
    },
    {
        "label": "Santa María",
        "id": 62,
        "key": 62,
        "region_id": 6
    },
    {
        "label": "Papudo",
        "id": 213,
        "key": 213,
        "region_id": 6
    },
    {
        "label": "Rancagua",
        "id": 63,
        "key": 63,
        "region_id": 7
    },
    {
        "label": "Machalí",
        "id": 64,
        "key": 64,
        "region_id": 7
    },
    {
        "label": "Gultro",
        "id": 65,
        "key": 65,
        "region_id": 7
    },
    {
        "label": "Codegua",
        "id": 66,
        "key": 66,
        "region_id": 7
    },
    {
        "label": "Doñihue",
        "id": 67,
        "key": 67,
        "region_id": 7
    },
    {
        "label": "Lo Miranda",
        "id": 68,
        "key": 68,
        "region_id": 7
    },
    {
        "label": "Graneros",
        "id": 69,
        "key": 69,
        "region_id": 7
    },
    {
        "label": "Las Cabras",
        "id": 70,
        "key": 70,
        "region_id": 7
    },
    {
        "label": "San Francisco de Mostazal",
        "id": 71,
        "key": 71,
        "region_id": 7
    },
    {
        "label": "Peumo",
        "id": 72,
        "key": 72,
        "region_id": 7
    },
    {
        "label": "Quinta de Tilcoco",
        "id": 73,
        "key": 73,
        "region_id": 7
    },
    {
        "label": "Rengo",
        "id": 74,
        "key": 74,
        "region_id": 7
    },
    {
        "label": "Requínoa",
        "id": 75,
        "key": 75,
        "region_id": 7
    },
    {
        "label": "San Vicente de Tagua Tagua",
        "id": 76,
        "key": 76,
        "region_id": 7
    },
    {
        "label": "Pichilemu",
        "id": 77,
        "key": 77,
        "region_id": 7
    },
    {
        "label": "San Fernando",
        "id": 78,
        "key": 78,
        "region_id": 7
    },
    {
        "label": "Chimbarongo",
        "id": 79,
        "key": 79,
        "region_id": 7
    },
    {
        "label": "Nancagua",
        "id": 80,
        "key": 80,
        "region_id": 7
    },
    {
        "label": "Palmilla",
        "id": 81,
        "key": 81,
        "region_id": 7
    },
    {
        "label": "Santa Cruz",
        "id": 82,
        "key": 82,
        "region_id": 7
    },
    {
        "label": "Talca",
        "id": 83,
        "key": 83,
        "region_id": 8
    },
    {
        "label": "Curicó",
        "id": 84,
        "key": 84,
        "region_id": 8
    },
    {
        "label": "Linares",
        "id": 85,
        "key": 85,
        "region_id": 8
    },
    {
        "label": "Constitución",
        "id": 86,
        "key": 86,
        "region_id": 8
    },
    {
        "label": "San Clemente",
        "id": 87,
        "key": 87,
        "region_id": 8
    },
    {
        "label": "Cauquenes",
        "id": 88,
        "key": 88,
        "region_id": 8
    },
    {
        "label": "Hualañé",
        "id": 89,
        "key": 89,
        "region_id": 8
    },
    {
        "label": "Molina",
        "id": 90,
        "key": 90,
        "region_id": 8
    },
    {
        "label": "Teno",
        "id": 91,
        "key": 91,
        "region_id": 8
    },
    {
        "label": "Longaví",
        "id": 92,
        "key": 92,
        "region_id": 8
    },
    {
        "label": "Parral",
        "id": 93,
        "key": 93,
        "region_id": 8
    },
    {
        "label": "San Javier",
        "id": 94,
        "key": 94,
        "region_id": 8
    },
    {
        "label": "Villa Alegre",
        "id": 95,
        "key": 95,
        "region_id": 8
    },
    {
        "label": "Concepción",
        "id": 96,
        "key": 96,
        "region_id": 9
    },
    {
        "label": "Talcahuano",
        "id": 97,
        "key": 97,
        "region_id": 9
    },
    {
        "label": "Chiguayante",
        "id": 98,
        "key": 98,
        "region_id": 9
    },
    {
        "label": "Coronel",
        "id": 99,
        "key": 99,
        "region_id": 9
    },
    {
        "label": "Hualqui",
        "id": 100,
        "key": 100,
        "region_id": 9
    },
    {
        "label": "Lota",
        "id": 101,
        "key": 101,
        "region_id": 9
    },
    {
        "label": "Penco",
        "id": 102,
        "key": 102,
        "region_id": 9
    },
    {
        "label": "Tomé",
        "id": 103,
        "key": 103,
        "region_id": 9
    },
    {
        "label": "Hualpén",
        "id": 104,
        "key": 104,
        "region_id": 9
    },
    {
        "label": "San Pedro de la Paz",
        "id": 105,
        "key": 105,
        "region_id": 9
    },
    {
        "label": "Los Ángeles",
        "id": 108,
        "key": 108,
        "region_id": 9
    },
    {
        "label": "Santa Juana",
        "id": 109,
        "key": 109,
        "region_id": 9
    },
    {
        "label": "Lebu",
        "id": 110,
        "key": 110,
        "region_id": 9
    },
    {
        "label": "Arauco",
        "id": 111,
        "key": 111,
        "region_id": 9
    },
    {
        "label": "Cañete",
        "id": 112,
        "key": 112,
        "region_id": 9
    },
    {
        "label": "Curanilahue",
        "id": 113,
        "key": 113,
        "region_id": 9
    },
    {
        "label": "Los Álamos",
        "id": 114,
        "key": 114,
        "region_id": 9
    },
    {
        "label": "Cabrero",
        "id": 115,
        "key": 115,
        "region_id": 9
    },
    {
        "label": "Monte Águila",
        "id": 116,
        "key": 116,
        "region_id": 9
    },
    {
        "label": "Conurbación La Laja-San Rosendo",
        "id": 117,
        "key": 117,
        "region_id": 9
    },
    {
        "label": "Mulchén",
        "id": 118,
        "key": 118,
        "region_id": 9
    },
    {
        "label": "Nacimiento",
        "id": 119,
        "key": 119,
        "region_id": 9
    },
    {
        "label": "Santa Bárbara",
        "id": 120,
        "key": 120,
        "region_id": 9
    },
    {
        "label": "Huépil",
        "id": 121,
        "key": 121,
        "region_id": 9
    },
    {
        "label": "Yumbel",
        "id": 122,
        "key": 122,
        "region_id": 9
    },
    {
        "label": "Pemuco",
        "id": 199,
        "key": 199,
        "region_id": 9
    },
    {
        "label": "Temuco",
        "id": 130,
        "key": 130,
        "region_id": 10
    },
    {
        "label": "Padre Las Casas",
        "id": 131,
        "key": 131,
        "region_id": 10
    },
    {
        "label": "Labranza",
        "id": 132,
        "key": 132,
        "region_id": 10
    },
    {
        "label": "Carahue",
        "id": 133,
        "key": 133,
        "region_id": 10
    },
    {
        "label": "Cunco",
        "id": 134,
        "key": 134,
        "region_id": 10
    },
    {
        "label": "Freire",
        "id": 135,
        "key": 135,
        "region_id": 10
    },
    {
        "label": "Gorbea",
        "id": 136,
        "key": 136,
        "region_id": 10
    },
    {
        "label": "Lautaro",
        "id": 137,
        "key": 137,
        "region_id": 10
    },
    {
        "label": "Loncoche",
        "id": 138,
        "key": 138,
        "region_id": 10
    },
    {
        "label": "Nueva Imperial",
        "id": 139,
        "key": 139,
        "region_id": 10
    },
    {
        "label": "Pitrufquén",
        "id": 140,
        "key": 140,
        "region_id": 10
    },
    {
        "label": "Pucón",
        "id": 141,
        "key": 141,
        "region_id": 10
    },
    {
        "label": "Villarrica",
        "id": 142,
        "key": 142,
        "region_id": 10
    },
    {
        "label": "Angol",
        "id": 143,
        "key": 143,
        "region_id": 10
    },
    {
        "label": "Collipulli",
        "id": 144,
        "key": 144,
        "region_id": 10
    },
    {
        "label": "Curacautín",
        "id": 145,
        "key": 145,
        "region_id": 10
    },
    {
        "label": "Purén",
        "id": 146,
        "key": 146,
        "region_id": 10
    },
    {
        "label": "Renaico",
        "id": 147,
        "key": 147,
        "region_id": 10
    },
    {
        "label": "Traiguén",
        "id": 148,
        "key": 148,
        "region_id": 10
    },
    {
        "label": "Victoria",
        "id": 149,
        "key": 149,
        "region_id": 10
    },
    {
        "label": "Vilcún",
        "id": 243,
        "key": 243,
        "region_id": 10
    },
    {
        "label": "Capitán Pastene",
        "id": 244,
        "key": 244,
        "region_id": 10
    },
    {
        "label": "Ercilla",
        "id": 255,
        "key": 255,
        "region_id": 10
    },
    {
        "label": "Valdivia",
        "id": 150,
        "key": 150,
        "region_id": 11
    },
    {
        "label": "Futrono",
        "id": 151,
        "key": 151,
        "region_id": 11
    },
    {
        "label": "La Unión",
        "id": 152,
        "key": 152,
        "region_id": 11
    },
    {
        "label": "Lanco",
        "id": 153,
        "key": 153,
        "region_id": 11
    },
    {
        "label": "Los Lagos",
        "id": 154,
        "key": 154,
        "region_id": 11
    },
    {
        "label": "San José de la Mariquina",
        "id": 155,
        "key": 155,
        "region_id": 11
    },
    {
        "label": "Paillaco",
        "id": 156,
        "key": 156,
        "region_id": 11
    },
    {
        "label": "Panguipulli",
        "id": 157,
        "key": 157,
        "region_id": 11
    },
    {
        "label": "Río Bueno",
        "id": 158,
        "key": 158,
        "region_id": 11
    },
    {
        "label": "Puerto Montt",
        "id": 159,
        "key": 159,
        "region_id": 12
    },
    {
        "label": "Puerto Varas",
        "id": 160,
        "key": 160,
        "region_id": 12
    },
    {
        "label": "Calbuco",
        "id": 161,
        "key": 161,
        "region_id": 12
    },
    {
        "label": "Fresia",
        "id": 162,
        "key": 162,
        "region_id": 12
    },
    {
        "label": "Frutillar",
        "id": 163,
        "key": 163,
        "region_id": 12
    },
    {
        "label": "Los Muermos",
        "id": 164,
        "key": 164,
        "region_id": 12
    },
    {
        "label": "Llanquihue",
        "id": 165,
        "key": 165,
        "region_id": 12
    },
    {
        "label": "Castro",
        "id": 166,
        "key": 166,
        "region_id": 12
    },
    {
        "label": "Ancud",
        "id": 167,
        "key": 167,
        "region_id": 12
    },
    {
        "label": "Quellón",
        "id": 168,
        "key": 168,
        "region_id": 12
    },
    {
        "label": "Osorno",
        "id": 169,
        "key": 169,
        "region_id": 12
    },
    {
        "label": "Purranque",
        "id": 170,
        "key": 170,
        "region_id": 12
    },
    {
        "label": "Río Negro",
        "id": 171,
        "key": 171,
        "region_id": 12
    },
    {
        "label": "Chaitén",
        "id": 214,
        "key": 214,
        "region_id": 12
    },
    {
        "label": "Chonchi",
        "id": 215,
        "key": 215,
        "region_id": 12
    },
    {
        "label": "Dalcahue",
        "id": 224,
        "key": 224,
        "region_id": 12
    },
    {
        "label": "Quinchao",
        "id": 225,
        "key": 225,
        "region_id": 12
    },
    {
        "label": "Maullín",
        "id": 229,
        "key": 229,
        "region_id": 12
    },
    {
        "label": "Coyhaique",
        "id": 172,
        "key": 172,
        "region_id": 13
    },
    {
        "label": "Puerto Aysén",
        "id": 173,
        "key": 173,
        "region_id": 13
    },
    {
        "label": "Chile Chico",
        "id": 212,
        "key": 212,
        "region_id": 13
    },
    {
        "label": "Cochrane",
        "id": 266,
        "key": 266,
        "region_id": 13
    },
    {
        "label": "Punta Arenas",
        "id": 174,
        "key": 174,
        "region_id": 14
    },
    {
        "label": "Puerto Natales",
        "id": 175,
        "key": 175,
        "region_id": 14
    },
    {
        "label": "Puerto Williams",
        "id": 211,
        "key": 211,
        "region_id": 14
    },
    {
        "label": "Santiago",
        "id": 176,
        "key": 176,
        "region_id": 15
    },
    {
        "label": "San José de Maipo",
        "id": 177,
        "key": 177,
        "region_id": 15
    },
    {
        "label": "Colina",
        "id": 178,
        "key": 178,
        "region_id": 15
    },
    {
        "label": "Lampa",
        "id": 179,
        "key": 179,
        "region_id": 15
    },
    {
        "label": "Batuco",
        "id": 180,
        "key": 180,
        "region_id": 15
    },
    {
        "label": "Tiltil",
        "id": 181,
        "key": 181,
        "region_id": 15
    },
    {
        "label": "Buin",
        "id": 182,
        "key": 182,
        "region_id": 15
    },
    {
        "label": "Alto Jahuel",
        "id": 183,
        "key": 183,
        "region_id": 15
    },
    {
        "label": "Bajos de San Agustín",
        "id": 184,
        "key": 184,
        "region_id": 15
    },
    {
        "label": "Paine",
        "id": 185,
        "key": 185,
        "region_id": 15
    },
    {
        "label": "Hospital",
        "id": 186,
        "key": 186,
        "region_id": 15
    },
    {
        "label": "Melipilla",
        "id": 187,
        "key": 187,
        "region_id": 15
    },
    {
        "label": "Curacaví",
        "id": 188,
        "key": 188,
        "region_id": 15
    },
    {
        "label": "Talagante",
        "id": 189,
        "key": 189,
        "region_id": 15
    },
    {
        "label": "El Monte",
        "id": 190,
        "key": 190,
        "region_id": 15
    },
    {
        "label": "Isla de Maipo",
        "id": 191,
        "key": 191,
        "region_id": 15
    },
    {
        "label": "La Islita",
        "id": 192,
        "key": 192,
        "region_id": 15
    },
    {
        "label": "Peñaflor",
        "id": 193,
        "key": 193,
        "region_id": 15
    },
    {
        "label": "Chillán",
        "id": 106,
        "key": 106,
        "region_id": 27
    },
    {
        "label": "Chillán Viejo",
        "id": 107,
        "key": 107,
        "region_id": 27
    },
    {
        "label": "Bulnes",
        "id": 123,
        "key": 123,
        "region_id": 27
    },
    {
        "label": "Coelemu",
        "id": 124,
        "key": 124,
        "region_id": 27
    },
    {
        "label": "Coihueco",
        "id": 125,
        "key": 125,
        "region_id": 27
    },
    {
        "label": "Quillón",
        "id": 126,
        "key": 126,
        "region_id": 27
    },
    {
        "label": "Quirihue",
        "id": 127,
        "key": 127,
        "region_id": 27
    },
    {
        "label": "San Carlos",
        "id": 128,
        "key": 128,
        "region_id": 27
    },
    {
        "label": "Yungay",
        "id": 129,
        "key": 129,
        "region_id": 27
    }
]