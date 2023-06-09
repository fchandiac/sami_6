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
const custumers = require('../../promises/customers')
const orders = require('../../promises/orders')
import SaveIcon from '@mui/icons-material/Save'



export default function Invoice(props) {
    const { open, setOpen, setOpenChangeDialog, setOpenPayDialog, paymentMethod, stockControl } = props
    const { dispatch, cart, movements, user, ordersInCart } = useAppContext()
    const [openFindCustomerDialog, setOpenFindCustomerDialog] = useState(false)
    const [customerData, setCustomerData] = useState(customerDataDefault())
    const [requestData, setRequestData] = useState({ rut: '', razon_social: '', actividades: [{ giro: '' }] })
    const [comunasOptions, setComunasOptions] = useState([])
    const [comunasInput, setComunasInput] = useState('')
    const [ciudadesOptions, setCiudadesOptions] = useState([])
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
        let token = ipcRenderer.sendSync('get-lioren', 'sync').token
        lioren.comunas(token)
            .then(res => {
                let data = res.map((item) => ({
                    label: item.nombre,
                    id: item.id,
                    key: item.id,
                    region_id: item.region_id,
                }))
                setComunasOptions(data)
            })
            .catch(err => { console.log(err) })
        custumers.findAll()
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

                // console.log(data)

                setCustomerOptions(data)
            })
            .catch(err => console.log(err))
    }, [])

    useEffect(() => {
        let token = ipcRenderer.sendSync('get-lioren', 'sync').token
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
        let token = ipcRenderer.sendSync('get-lioren', 'sync').token
        lioren.ciudades(token)
            .then(res => {
                // console.log(res)
                let data = res.map((item) => ({
                    label: item.nombre,
                    id: item.id,
                    key: item.id,
                    region_id: item.region_id,
                }))
                setCiudadesOptions(data)
            })
            .catch(err => { console.log(err) })
    }, [])

    useEffect(() => {
        let token = ipcRenderer.sendSync('get-lioren', 'sync').token
        if (customerData.direccion !== '') {
            lioren.ciudades(token)
                .then(res => {
                    // console.log(res)
                    let data = res.map((item) => ({
                        label: item.nombre,
                        id: item.id,
                        key: item.id,
                        region_id: item.region_id,
                    }))
                    data = data.filter((item) => item.region_id === customerData.comuna.region_id)
                    setCiudadesOptions(data)
                })
                .catch(err => { console.log(err) })
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

    const closeOrders = async() => {
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
        const findCustomer = await custumers.findOneByRut(customerData.rut)
        console.log('findCustomer', findCustomer)
        if (findCustomer == undefined) {
            custumers.create(customerData.rut, customerData.razon_social, customerData.giro, customerData.comuna.id, customerData.ciudad.id, customerData.direccion)
                .then(() => {
                    custumers.findAll()
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

    const savePay = async ( paymentMethod, sale_id, amount, client_id) => {
        const pay = new Promise((resolve, reject) => {
            let paymentMethods = ipcRenderer.sendSync('get-payment-methods', 'sync')
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
            let token = ipcRenderer.sendSync('get-lioren', 'sync').token
            let data = facturaData()
            const factura = await lioren.factura(token, data)
            const sale = await saleFactura(factura.folio, factura.montototal)
            await saleDetailAll(sale.id, cart)
            let print_info = printInfo(factura, sale.id)
            if (stockControl){
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