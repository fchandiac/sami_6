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
const utils = require('../../utils')
const https = require('https');
const PDF417 = require("pdf417-generator")
const custumers = require('../../promises/customers')
import SaveIcon from '@mui/icons-material/Save'






export default function Invoice(props) {
    const { open, setOpen, setOpenChangeDialog, setOpenPayDialog } = props
    const { dispatch, cart, movements, user } = useAppContext()
    const [findCustomerDialog, setFindCustomerDialog] = useState(false)
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
    const [token, setToken] = useState('')
    const [showPay, setShowPay] = useState(false)
    const [payData, setPayData] = useState(payDataDefault())
    const [paymentMethodsOptions, setPaymentMethodsOptions] = useState([])
    const [paymentMethodsInput, setPaymentMethodsInput] = useState('')
    const [customerInput, setCustomerInput] = useState('')
    const [customerOptions, setCustomerOptions] = useState([])
    const [customer, setCustomer] = useState({ key: 0, id:0, rut: '', label: '', activity: '', district: 0, city: 0, address: '' })

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
            .then(res =>{
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
                console.log(res)
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

    const printDocument = async (data) => {
        switch (printMode()) {
            case 0:
                if (await ipcRenderer.invoke('find-printer', printer) == false) {
                    dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'Error de conexión con la impresora' } })
                } else {
                    factura = await lioren.factura(token, data)

                    let stamp_str = stamp(factura.xml)
                    console.log(stamp_str)
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
                    }
                    ipcRenderer.send('factura', printInfo)
                    const pdfData = Buffer.from(factura.pdf, 'base64')
                    const pdfUrl = URL.createObjectURL(new Blob([pdfData], { type: 'application/pdf' }));
                    window.open(pdfUrl)
                    const sale = await saleFactura(factura.folio, factura.montototal)
                    await saleDetailAll(sale.id, cart)
                    setOpenPayDialog(false)
                    setOpen(false)
                    setCustomerData(customerDataDefault())
                    setReferenceData(referenceDataDefault())
                    setPayData(payDataDefault())
                    setOpenChangeDialog(true)
                    break
                }
            case 1:
                if (await ipcRenderer.invoke('find-printer', printer) == false) {
                    dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'Error de conexión con la impresora' } })
                } else {
                    factura = await lioren.factura(token, data)

                    let stamp_str = stamp(factura.xml)
                    console.log(stamp_str)
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
                        total: total(),
                        iva: factura.montoiva,
                        invoiceNumber: factura.folio,
                        cart: cart,
                        customer: customerData,
                    }
                    ipcRenderer.send('factura', printInfo)
                    const sale = await saleFactura(factura.folio, factura.montototal)
                    await saleDetailAll(sale.id, cart)
                    setOpenPayDialog(false)
                    setOpen(false)
                    setCustomerData(customerDataDefault())
                    setReferenceData(referenceDataDefault())
                    setPayData(payDataDefault())
                    setOpenChangeDialog(true)
                    break
                }
            case 2:
                factura = await lioren.factura(token, data)
                const pdfData = Buffer.from(factura.pdf, 'base64')
                const pdfUrl = URL.createObjectURL(new Blob([pdfData], { type: 'application/pdf' }));
                window.open(pdfUrl)
                const sale = await saleFactura(factura.folio, factura.montototal)
                    await saleDetailAll(sale.id, cart)
                setOpenPayDialog(false)
                setOpen(false)
                setCustomerData(customerDataDefault())
                setReferenceData(referenceDataDefault())
                setPayData(payDataDefault())
                setOpenChangeDialog(true)

                break
            case 3:
                factura = await lioren.factura(token, data)
                const sale_1 = await saleFactura(factura.folio, factura.montototal)
                await saleDetailAll(sale_1.id, cart)
                setOpenPayDialog(false)
                setOpen(false)
                setCustomerData(customerDataDefault())
                setReferenceData(referenceDataDefault())
                setPayData(payDataDefault())
                setOpenChangeDialog(true)
                console.log('factura', factura)

                dispatch({ type: 'OPEN_SNACK', value: { type: 'success', message: 'Factura enviada al Sii' } })

                break
            default:
                break
        }
    }

    const factura = async () => {
        console.log('detalles', formatCart())
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

        printDocument(data)
            .then((res) => {
                console.log(factura)
            })
            .catch((err) => { console.log(err) })


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
        let date = moment(referenceData.date).add(quanty, 'days')
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
                                    onClick={() => { addDaysToPay(90) }}
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

    const saveCustomer = () => {
        custumers.create(customerData.rut, customerData.razon_social, customerData.giro, customerData.comuna.id, customerData.ciudad.id, customerData.direccion)
        .then( () => {
            custumers.findAll()
            .then(res =>{
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
    }

    const saleDetailAll = (sale_id, cart) => {
        let details = []
        cart.map(product => {
            console.log('product', product)
            details.push(salesDetails.create(sale_id, product.id, product.quanty, product.sale, product.discount, product.subTotal))
        })

        return Promise.all(details)
    }

    const saleFactura = (dte_number, total) => {
        const pr = new Promise((resolve, reject) => {
            sales.create(total, 'Factura', 33, dte_number)
                .then(res => {
                    let movs = movements.movements
                    movs.push({
                        sale_id: res.id,
                        user: user.name,
                        type: 1004,
                        amount: total,
                        payment_method:'Factura',
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
                                                    customerData.rut = utils.formatRut(newValue.rut)
                                                    customerData.razon_social = newValue.label
                                                    customerData.direccion = newValue.address
                                                    // customerData.comuna = newValue.district
                                                    // customerData.ciudad = newValue.city
                                                    customerData.giro = newValue.activity
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
                                                variant="outlined"
                                                size={'small'}
                                                fullWidth
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={12} md={12} lg={12}>
                                            <TextField
                                                label='Giro'
                                                value={customerData.giro}
                                                variant="outlined"
                                                size={'small'}
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
                        <Button variant={'outlined'} onClick={() => { setOpen(false); setCustomerData(customerDataDefault()) }}>Cerrar</Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={findCustomerDialog} fullWidth maxWidth={'xs'}>
                <DialogTitle sx={{ p: 2 }}>Factura</DialogTitle>
                <DialogContent sx={{ p: 2 }}>
                    <Grid container spacing={1} direction={'column'}>
                        <Grid item marginTop={1}>
                            <AppPaper title={'Receptor'}>
                                <Grid container spacing={2} p={1}>
                                    <Grid item>
                                        {/* <TextField
                                                label='Rut'
                                                variant="outlined"
                                                size={'small'}
                                                fullWidth
                                                required
                                            /> */}
                                        {/* <IconButton>
                                                <SearchIcon />
                                            </IconButton> */}

                                    </Grid>
                                </Grid>
                            </AppPaper>
                        </Grid>
                        <Grid item marginTop={1}>
                            <TextField
                                label="Vuelto:"

                                InputProps={{
                                    readOnly: true,
                                }}
                                variant="outlined"
                                size={'small'}
                                fullWidth

                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button variant={'outlined'} onClick={() => { setFindCustomerDialog(false) }}>Cerrar</Button>
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