import React, { useState, useEffect } from 'react'
import AppDataGrid from '../../AppDataGrid/AppDataGrid'
import { useAppContext } from '../../../AppProvider'
import { GridActionsCellItem } from '@mui/x-data-grid'
import DeleteIcon from '@mui/icons-material/Delete'
import InfoIcon from '@mui/icons-material/Info'
import PrintIcon from '@mui/icons-material/Print'
import { Dialog, DialogActions, DialogTitle, DialogContent, Grid, TextField, Button } from '@mui/material'

import electron from 'electron'

import moment from 'moment'
import AppInfoDataGrid from '../../AppInfoDataGrid/AppInfoDataGrid'
import DetailsGrid from '../DetailsGrid/DetailsGrid'
const ipcRenderer = electron.ipcRenderer || false
const PDF417 = require("pdf417-generator")

const utils = require('../../../utils')
const sales = require('../../../promises/sales')
const lioren = require('../../../promises/lioren')
const customers = require('../../../promises/customers')


export default function MovementsGrid() {
    const { movements, dispatch, lock, user } = useAppContext()
    const [gridApiRef, setGridApiRef] = useState(null)
    const [rowData, setRowData] = useState(rowDataDefault())
    const [movementsList, setMovementsList] = useState([])
    const [openDestroyDialog, setOpenDestroyDialog] = useState(false)
    const [openDetailDialog, setOpenDetailDialog] = useState(false)
    const [printer, setPrinter] = useState({ idVendor: 0, idProduct: 0 })
    const [ticketInfo, setTicketInfo] = useState({ name: '', address: '', phone: '', rut: '' })

    useEffect(() => {
        let printer = ipcRenderer.sendSync('get-printer', 'sync')
        let ticket_info = ipcRenderer.sendSync('get-ticket-info', 'sync')
        setPrinter(printer)
        setTicketInfo(ticket_info)
    }, [])

    useEffect(() => {
        let data = movements.movements.map((item, index) => ({
            id: index + 1000,
            user: item.user,
            type: getMovementType(item.type),
            sale_id: item.sale_id,
            dteType: getDteType(item.dte_code),
            dteNumber: item.dte_number == 0 ? 'Sin DTE' : item.dte_number,
            amount: item.amount,
            paymentMethod: item.payment_method,
            balance: item.balance == null ? 0 : item.balance,
            date: moment(item.date).format('HH:mm:ss'),
        }))
        data.reverse()
        setMovementsList(data)
    }, [movements])

    const getMovementType = (typeCode) => {
        switch (typeCode) {
            case 1001: return 'Apertura'
            case 1002: return 'Ingreso'
            case 1003: return 'Egreso'
            case 1004: return 'Venta'
            case 1005: return 'nota de crédito'
            case 1006: return 'Cierre'
            case 1007: return 'Venta eliminada'
            default: return ''
        }
    }

    const getDteType = (dteCode) => {
        switch (dteCode) {
            case 33: return 'Factura'
            case 34: return 'Factura Exenta'
            case 61: return 'Nota de crédito'
            case 56: return 'Nota de débito'
            case 39: return 'Boleta'
            default: return 'Sin DTE'
        }
    }

    const destroy = () => {
        let mov = movements.movements.find((item, index) => index == (rowData.id - 1000))
        let movs = movements.movements
        movs[rowData.id - 1000].type = 1007
        let saleId = movs[rowData.id - 1000].sale_id
        let newMov = {
            sale_id: 0,
            user: user.name,
            type: 1005,
            amount: mov.amount * -1,
            payment_method: mov.payment_method,
            balance: movements.balance - mov.amount,
            dte_code: 0,
            dte_number: 0,
            date: new Date()
        }
        movs.push(newMov)

        let newMovs = {
            state: true,
            balance: movements.balance - mov.amount,
            movements: movs
        }

        sales.destroy(saleId)
        .then(res => {
            ipcRenderer.send('update-movements', newMovs)
        dispatch({ type: 'SET_MOVEMENTS', value: newMovs })
        setOpenDestroyDialog(false)
        })
        .catch(err => {
            console.log(err)
        })
    }

    const displayDestroy = (type) => {
        if (lock == true) {
            return false
        } else {
            switch (type) {
                case 'Apertura': return false
                case 'Ingreso': return false
                case 'Egreso': return false
                case 'Venta': return true
                case 'Cierre': return false
                case 'nota de crédito': return false
                default: return false
            }
        }
    }

    const displayInfo = (type) => {
        if (type == 'Venta') {
            return true
        } else {
            return false
        }
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
        { field: 'id', headerName: 'Id', flex: .3, type: 'number', hide: true },
        { field: 'user', headerName: 'Usuario', flex: .5 },
        { field: 'type', headerName: 'Tipo', flex: .5 },
        { field: 'sale_id', headerName: 'Venta', flex: .3, type: 'number' },
        { field: 'paymentMethod', headerName: 'Medio de pago', flex: .5 },
        { field: 'dteType', headerName: 'DTE', flex: .4 },
        { field: 'dteNumber', headerName: 'N° DTE', flex: .4, type: 'number' },
        { field: 'amount', headerName: 'Monto', flex: .5, type: 'number', valueFormatter: (params) => (utils.renderMoneystr(params.value)) },
        { field: 'balance', headerName: 'Balance', flex: .5, type: 'number', valueFormatter: (params) => (utils.renderMoneystr(params.value)) },
        { field: 'date', headerName: 'Hora', flex: .5 },
        {
            field: 'actions',
            headerName: '',
            headerClassName: 'data-grid-last-column-header',
            type: 'actions', flex: .6, getActions: (params) => [
                <GridActionsCellItem
                    sx={{ display: displayDestroy(params.row.type) ? 'inline-flex' : 'none' }}
                    label='delete'
                    icon={<DeleteIcon />}
                    onClick={() => {
                        setRowData({
                            rowId: params.id,
                            id: params.row.id,
                            amount: params.row.amount,
                            paymentMethod: params.row.paymentMethod,
                            date: params.row.date,
                        })
                        setOpenDestroyDialog(true)
                    }}
                />,
                <GridActionsCellItem
                    sx={{ display: displayInfo(params.row.type) ? 'inline-flex' : 'none' }}
                    label='info'
                    icon={<InfoIcon />}
                    onClick={() => {
                        setRowData({
                            rowId: params.id,
                            id: params.row.id,
                            amount: params.row.amount,
                            paymentMethod: params.row.paymentMethod,
                            date: params.row.date,
                            sale_id: params.row.sale_id
                        })
                        setOpenDetailDialog(true)
                    }}
                />,
                <GridActionsCellItem
                    sx={{ display: displayInfo(params.row.type) ? 'inline-flex' : 'none' }}
                    label='print'
                    icon={<PrintIcon />}
                    onClick={() => {
                        rePrintDoc(params.row.sale_id)
                    }}
                />
            ]
        }
    ]

    return (
        <>
            <AppInfoDataGrid
                title={'Movimientos de caja'}
                rows={movementsList} columns={columns}
                height='80vh'
                setGridApiRef={setGridApiRef}
                gridApiRef={gridApiRef}
                infoField={'amount'}
                infoTitle={'Total movimientos'}
                money={true}
            />
            <Dialog open={openDestroyDialog} maxWidth={'xs'} fullWidth>
                <DialogTitle sx={{ p: 2 }}>
                    Eliminar Movimiento
                </DialogTitle>
                <form onSubmit={(e) => { e.preventDefault(); destroy() }}>
                    <DialogContent sx={{ p: 2 }}>
                        <Grid container spacing={1} direction={'column'}>
                            <Grid item marginTop={1}>
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
                                    label="Moento"
                                    value={utils.renderMoneystr(rowData.amount)}
                                    inputProps={{ readOnly: true }}
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    label="Medio de pago"
                                    value={rowData.paymentMethod}
                                    inputProps={{ readOnly: true }}
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    label="Hora"
                                    value={rowData.date}
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
                    Detalle de Venta
                </DialogTitle>
                <form onSubmit={(e) => { e.preventDefault(); destroy() }}>
                    <DialogContent sx={{ p: 2 }}>
                        <Grid container spacing={1} direction={'column'}>
                            <Grid item marginTop={1}>
                                <TextField
                                    label="Id movimiento"
                                    value={rowData.id}
                                    inputProps={{ readOnly: true }}
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    label="Monto"
                                    value={utils.renderMoneystr(rowData.amount)}
                                    inputProps={{ readOnly: true }}
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    label="Medio de pago"
                                    value={rowData.paymentMethod}
                                    inputProps={{ readOnly: true }}
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    label="Hora"
                                    value={rowData.date}
                                    inputProps={{ readOnly: true }}
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item>
                                <DetailsGrid sale_id={rowData.sale_id} />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button variant={'outlined'} onClick={() => setOpenDetailDialog(false)}>Cerrar</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    )
}

function rowDataDefault() {
    return ({
        rowId: 0,
        id: 0,
        amount: 0,
        paymentMethod: '',
        date: new Date()
    })
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