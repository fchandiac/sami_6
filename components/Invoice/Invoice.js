import React, { useEffect, useState } from 'react'
import {
    Dialog, DialogContent, DialogTitle, DialogActions, Button, TextField, Grid,
    Typography, FormGroup, FormControlLabel, Checkbox, Autocomplete, IconButton, Stack, Switch
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import AppPaper from '../AppPaper/AppPaper'
import { useAppContext } from '../../AppProvider'
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker'

import electron, { BrowserWindow } from 'electron'
import moment from 'moment'
import { teal } from '@mui/material/colors'
const ipcRenderer = electron.ipcRenderer || false

const lioren = require('../../promises/lioren')
const utils = require('../../utils')
const https = require('https');
const PDF417 = require("pdf417-generator")



export default function Invoice(props) {
    const { open, setOpen, setOpenChangeDialog, setOpenPayDialog } = props
    const { dispatch, cart } = useAppContext()
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

    useEffect(() => {
        let printer = ipcRenderer.sendSync('get-printer', 'sync')
        let ticket_info = ipcRenderer.sendSync('get-ticket-info', 'sync')
        setPrinter(printer)
        setTicketInfo(ticket_info)
    }, [])

    useEffect(() => {
        let token = ipcRenderer.sendSync('get-lioren', 'sync').token
        lioren.comunas(token)
            .then(res => {
                // console.log(res) 
                let data = res.map((item) => ({
                    label: item.nombre,
                    id: item.id,
                    key: item.id,
                    region_id: item.region_id,
                }))
                setComunasOptions(data)
            })
            .catch(err => { console.log(err) })
    }, [])

    useEffect(() => {
        let token = ipcRenderer.sendSync('get-lioren', 'sync').token
        lioren.ciudades(token)
            .then(res => {
                let data = res.map((item) => ({
                    label: item.nombre,
                    id: item.id,
                    key: item.id,
                    region_id: item.region_id,
                }))
                console.log('region', customerData.comuna)
                data = data.filter((item) => item.region_id === customerData.comuna.region_id)
                setCiudadesOptions(data)
            })
            .catch(err => { console.log(err) })
    }, [customerData.comuna])

    // useEffect(() => {
    //     setCustomerData({
    //         ...customerData, 
    //         razon_social: requestData.razon_social,
    //         giro: requestData.actividades[0].giro,
    //     })
    // }, [requestData])


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
            // "referencias": [
            //     {
            //         "fecha": moment(new Date()).format('YYYY-MM-DD'),
            //         "tipodoc": referenceData.tipodoc.key,
            //         "folio": "123456",
            //         "razon": 4,
            //         "glosa": "Esta es una glosa un poco ",
            //     }
            // ],
            "expects": "all"
        }

        let token = ipcRenderer.sendSync('get-lioren', 'sync').token

        let factura = []

        if (thermalPrinting) {
            if (await ipcRenderer.invoke('find-printer', printer) == false) {
                dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'Error de conexión con la impresora' } })
            } else {
                factura = await lioren.factura(token, data)
                if (pdfView) {
                    const pdfData = Buffer.from(factura.pdf, 'base64')
                    const pdfUrl = URL.createObjectURL(new Blob([pdfData], { type: 'application/pdf' }));
                    window.open(pdfUrl)
                }

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
                setOpenPayDialog(false)
                setOpen(false)
                setCustomerData(customerDataDefault())
                setOpenChangeDialog(true)

            }
        } else if (thermalPrinting == false && pdfView == false) {
            factura = await lioren.factura(token, data)
            setOpenPayDialog(false)
            setOpen(false)
            setCustomerData(customerDataDefault())
            setOpenChangeDialog(true)
            dispatch({ type: 'OPEN_SNACK', value: { type: 'success', message: 'Factura enviada al Sii' } })
        } else if (thermalPrinting == false && pdfView == true) {
            factura = await lioren.factura(token, data)
            const pdfData = Buffer.from(factura.pdf, 'base64')
            const pdfUrl = URL.createObjectURL(new Blob([pdfData], { type: 'application/pdf' }));
            window.open(pdfUrl)
            setOpenPayDialog(false)
            setOpen(false)
            setCustomerData(customerDataDefault())
            setOpenChangeDialog(true)
        }

        console.log(factura)
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
                                    <Grid container spacing={1} direction={'column'} p={1}>
                                        <Grid item>
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
                                            </Stack>
                                        </Grid>
                                        <Grid item>
                                            <TextField
                                                label='Razon social'
                                                value={customerData.razon_social}
                                                variant="outlined"
                                                size={'small'}
                                                fullWidth
                                                required
                                            />
                                        </Grid>
                                        <Grid item>
                                            <TextField
                                                label='Giro'
                                                value={customerData.giro}
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
                                        <Grid item>
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
                                        <Grid item>
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

                            {/* 
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
                        </Grid> */}

                            {/* <Grid item marginTop={1} sx={{display: showReference? 'block': 'none'}}>
                            <AppPaper title={'Referencia'}>
                                <Grid container spacing={1} direction={'column'} p={1}>
                                    <Grid item>
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
                                            renderInput={(params) => <TextField {...params} label='Tipo Documento' size={'small'} fullWidth required />}
                                        />
                                    </Grid>
                                    <Grid item>
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
                                </Grid>
                            </AppPaper>
                        </Grid> */}

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
        folio: "123456",
        razon: 4,
        glosa: "Esta es una glosa un poco ",
    }
}




function docsRef() {
    return [
        { key: 30, label: '30 Factura' },
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