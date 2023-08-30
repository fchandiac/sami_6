import React, { useState, useEffect } from 'react'
import AppDataGrid from '../../AppDataGrid'
import { GridActionsCellItem } from '@mui/x-data-grid'
import DeleteIcon from '@mui/icons-material/Delete'
import InfoIcon from '@mui/icons-material/Info'
import PrintIcon from '@mui/icons-material/Print'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, Autocomplete } from '@mui/material'

import AppInfoDataGrid from '../../AppInfoDataGrid'
import moment from 'moment'
import DetailsGrid from '../DetailsGrid/DetailsGrid'

import electron from 'electron'
const ipcRenderer = electron.ipcRenderer || false
const PDF417 = require("pdf417-generator")

const sales = require('../../../promises/sales')
const utils = require('../../../utils')
const lioren = require('../../../promises/lioren')

export default function SalesGrid(props) {
    const { filterDates } = props
    const [gridApiRef, setGridApiRef] = useState(null)
    const [rowData, setRowData] = useState(rowDataDefault())
    const [salesList, setSalesList] = useState([])
    const [openDestroyDialog, setOpenDestroyDialog] = useState(false)
    const [openDetailDialog, setOpenDetailDialog] = useState(false)
    const [title, setTitle] = useState('Ventas')
    const [printer, setPrinter] = useState({ idVendor: 0, idProduct: 0 })
    const [ticketInfo, setTicketInfo] = useState({ name: '', address: '', phone: '', rut: '' })

    useEffect(() => {
        let printer = ipcRenderer.sendSync('get-printer', 'sync')
        let ticket_info = ipcRenderer.sendSync('get-ticket-info', 'sync')
        setPrinter(printer)
        setTicketInfo(ticket_info)
    }, [])

    useEffect(() => {
        if (moment(filterDates.start).format('DD-MM-YYYY') == moment(filterDates.end).format('DD-MM-YYYY')) {
            setTitle('Ventas del ' + moment(filterDates.start).format('DD-MM-YYYY'))
        } else {
            setTitle('Ventas del ' + moment(filterDates.start).format('DD-MM-YYYY') + ' al ' + moment(filterDates.end).format('DD-MM-YYYY'))
        }

    }, [filterDates])


    useEffect(() => {
        sales.findAllBetweenDates(filterDates.start, filterDates.end)
            .then((res) => {
                console.log(res)
                let data = res.map((item) => ({
                    id: item.id,
                    amount: item.amount,
                    date: item.createdAt,
                    dte_code: dteString(item.dte_code),
                    dte_number: item.dte_number,
                    payment_method: item.payment_method,
                    stock_control: item.stock_control,
                    user: item.User.name

                }))
                setSalesList(data)
            })
            .catch(err => { console.error(err) })

    }, [filterDates])

    const destroy = () => {
        sales.destroy(rowData.id)
            .then(() => {
                gridApiRef.current.updateRows([{ id: rowData.rowId, _action: 'delete' }])
                setOpenDestroyDialog(false)
            })
            .catch(err => { console.error(err) })
    }

    const printInfo =  (dte_code, dte, sale, cart) => {
        switch (dte_code) {
            case 33:
                let stamp_str_33 = stamp(dte.xml)
                let canvas_33 = document.createElement('canvas')
                PDF417.draw(stamp_str_33, canvas_33, 2, 2, 1.5)
                let stamp_img_33 = canvas_33.toDataURL('image/jpg')

                let customerData = {
                    rut: dte.rut,
                    razon_social: dte.rs,
                    giro: '',
                    direccion: '',
                }

                let printInfo_33 = {
                    printer: printer,
                    stamp: stamp_img_33,
                    date: moment(sale.createdAt).format('DD-MM-yyyy'),
                    time: moment(sale.createdAt).format('HH:mm'),
                    name: ticketInfo.name,
                    rut: ticketInfo.rut,
                    address: ticketInfo.address,
                    phone: ticketInfo.phone,
                    total: dte.montototal,
                    iva: dte.montoiva,
                    invoiceNumber: dte.folio,
                    cart: cart,
                    customer: customerData,
                    paymentMethod: sale.payment_method,
                    sale_id: sale.id
                }
                return printInfo_33

            case 39:
                let stamp_str = stamp(dte.xml)
                let canvas = document.createElement('canvas')
                PDF417.draw(stamp_str, canvas, 2, 2, 1.5)
                let stamp_img = canvas.toDataURL('image/jpg')
                let printInfo_39 = {
                    printer: printer,
                    stamp: stamp_img,
                    date: moment(sale.createdAt).format('DD-MM-yyyy'),
                    time: moment(sale.createdAt).format('HH:mm'),
                    name: ticketInfo.name,
                    rut: ticketInfo.rut,
                    address: ticketInfo.address,
                    phone: ticketInfo.phone,
                    total: sale.amount,
                    iva: dte.montoiva,
                    invoiceNumber: dte.folio,
                    cart: cart,
                    paymentMethod: sale.payment_method,
                    sale_id: sale.id
                }
                return printInfo_39
            case 0:
                let date = moment(sale.createdAt).format('DD-MM-yyyy')
                let time = moment(sale.createdAt).format('HH:mm')
                let printInfo = {
                    printer: printer,
                    date: date,
                    time: time,
                    ticketInfo: ticketInfo,
                    total: sale.amount,
                    cart: cart,
                    paymentMethod: sale.payment_method,
                    sale_id: sale.id
                }
                return printInfo
            default:
                return false
                break
        }


    }

    const rePrintDoc = async (sale_id) => {
        const findPrinter = await ipcRenderer.invoke('find-printer', printer)
        if (!findPrinter) {
            dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'Error de conexión con la impresora' } })
        } else {
            const sale = await sales.findOneById(sale_id)
            console.log('sale', sale)
            let cart = reProccessCart(sale.salesdetails)
            if (sale.dte_code == 0) {
                let print_info = printInfo(sale.dte_code, [], sale, cart)
                console.log(print_info)
                ipcRenderer.sendSync('print-ticket', print_info)
            } else if (sale.dte_code == 39) {
                let token = ipcRenderer.sendSync('get-lioren', 'sync').token
                const dte = await lioren.consultaBoleta(token, sale.dte_number)
                let print_info_39 = printInfo(sale.dte_code, dte, sale, cart)
                ipcRenderer.sendSync('boleta', print_info_39)
            } else if (sale.dte_code == 33) {
                let token = ipcRenderer.sendSync('get-lioren', 'sync').token
                const dte = await lioren.consultaDte(token, '33', sale.dte_number)
                console.log(dte)
                let print_info = printInfo(sale.dte_code, dte, sale, cart)
                ipcRenderer.sendSync('factura', print_info)
            }
            // let token = ipcRenderer.sendSync('get-lioren', 'sync').token
            // const dte = await lioren.consultaDte(token, sale.dte_code, sale.dte_number)
            //console.log(cart)
        }

    }

    const columns = [
        { field: 'id', headerName: 'Id', flex: .5, type: 'number' },
        { field: 'user', headerName: 'Vendedor', flex: 1 },
        { field: 'amount', headerName: 'Monto', flex: 1, type: 'number', valueFormatter: (params) => utils.renderMoneystr(params.value) },
        { field: 'payment_method', headerName: 'Medio de pago', flex: 1 },
        { field: 'dte_code', headerName: 'DTE', flex: .6 },
        { field: 'dte_number', headerName: 'N° DTE', flex: .7 },
        { field: 'date', headerName: 'Fecha - hora', flex: 1, type: 'dateTime', valueFormatter: (params) => moment(params.value).format('DD-MM-YYYY HH:mm') },
        {
            field: 'actions',
            headerName: '',
            headerClassName: 'data-grid-last-column-header',
            type: 'actions', flex: .9, getActions: (params) => [
                <GridActionsCellItem
                    label='delete'
                    icon={<DeleteIcon />}
                    onClick={() => {
                        setRowData({
                            rowId: params.id,
                            id: params.row.id,
                            amount: params.row.amount,
                        })
                        setOpenDestroyDialog(true)
                    }}
                />,
                <GridActionsCellItem
                    label='info'
                    icon={<InfoIcon />}
                    onClick={() => {
                        setRowData({
                            rowId: params.id,
                            id: params.row.id,
                            amount: params.row.amount,
                        })
                        setOpenDetailDialog(true)
                    }}
                />,
                <GridActionsCellItem
                    label='print'
                    icon={<PrintIcon />}
                    onClick={() => {
                        setRowData({
                            rowId: params.id,
                            id: params.row.id,
                            amount: params.row.amount,
                        })
                        rePrintDoc(params.row.id)
                    }}
                />
            ]
        }
    ]

    return (
        <>

            <AppInfoDataGrid
                title={title}
                rows={salesList}
                columns={columns}
                height='80vh'
                setGridApiRef={setGridApiRef}
                infoField={'amount'}
                infoTitle={'Total ventas: '}
                money={true}
            />

            <Dialog open={openDestroyDialog} maxWidth={'xs'} fullWidth>
                <DialogTitle sx={{ p: 2 }}>
                    Eliminar venta
                </DialogTitle>
                <form onSubmit={(e) => { e.preventDefault(); destroy() }}>
                    <DialogContent sx={{ p: 2 }}>
                        <Grid container spacing={1} direction={'column'}>
                            <Grid item>
                                <TextField
                                    label="Id"
                                    value={rowData.id}
                                    inputProps={{ readOnly: true }}
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    label='Monto'
                                    value={utils.renderMoneystr(rowData.amount)}
                                    inputProps={{ readOnly: true }}
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                />
                            </Grid>

                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button variant={'contained'} type={'submit'}>Eliminar</Button>
                        <Button variant={'outlined'} onClick={() => setOpenDestroyDialog(false)}>Cerrar</Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={openDetailDialog} maxWidth={'md'} fullWidth>
                <DialogTitle sx={{ p: 2 }}>
                    Detalle de venta
                </DialogTitle>
                <DialogContent sx={{ p: 2 }}>
                    <Grid container spacing={1} direction={'column'}>
                        <Grid item>
                           <DetailsGrid sale_id = {rowData.id}/>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button variant={'outlined'} onClick={() => setOpenDetailDialog(false)}>Cerrar</Button>
                </DialogActions>

            </Dialog>
        </>
    )
}

function dteString(value) {
    if (value === 33) {
        return 'Factura'
    } else if (value === 39) {
        return 'Boleta'
    } else {
        return 'Sin DTE'
    }
}

function rowDataDefault() {
    return {
        id: 0,
        amount: 0,
        date: '',
        dte_code: 0,
        dte_number: 0,
        payment_method: 0,
        stock_control: false
    }
}

function reProccessCart(details) {
    console.log(details)
    let cart = details.map(item => ({
        id: item.id,
        name: item.name,
        sale: item.sale,
        quanty: item.quanty,
        subTotal: item.subtotal
    }))
    return cart
}

function stamp(xml) {
    let buff = Buffer.from(xml, 'base64');
    xml = buff
    var parseString = require('xml2js').parseString; // paso de xml a json
    parseString(xml, function (err, result) {
        xml = result
    });


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