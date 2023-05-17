import React, { useRef, useEffect, useState } from 'react'
import BackspaceIcon from '@mui/icons-material/Backspace'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import {
    Dialog, DialogContent, DialogTitle, DialogActions, Button, TextField, Grid,
    Typography, FormGroup, FormControlLabel, Checkbox, Autocomplete, IconButton
} from '@mui/material'
import { useAppContext } from '../../../AppProvider'
import electron from 'electron'
import AppPaper from '../../AppPaper/AppPaper'
import moment from 'moment'
const PDF417 = require("pdf417-generator")

const ipcRenderer = electron.ipcRenderer || false

const utils = require('../../../utils')
const print = require('../../../promises/print')
const stocks = require('../../../promises/stocks')
const sales = require('../../../promises/sales')
const lioren = require('../../../promises/lioren')



export default function PayDialog(props) {
    const { open, setOpen, total, stockControl } = props
    const { dispatch, cart, movements, user, webConnection } = useAppContext()
    const [payAmount, setPayAmount] = useState(0)
    const [change, setChange] = useState(0)
    const [disablePay, setDisablePay] = useState(true)
    const [openChangeDialog, setOpenChangeDialog] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState('Efectivo')
    const [paymentMethodsList, setPaymentMethodsList] = useState([])
    const [printer, setPrinter] = useState({ idProduct: 0, idVendor: 0 })
    const [ticketInfo, setTicketInfo] = useState({ name: '', address: '', phone: '', rut: '' })
    const [showCustomerFinder, setShowCustomerFinder] = useState(false)
    const [customersOptions, setCustomersOptions] = useState([])
    const [customerInput, setCustomerInput] = useState('')
    const [customer, setCustomer] = useState(null)
    const [documentType, setDocumentType] = useState('Ticket')
    const [documentTypesList, setDocumentTypesList] = useState([])
    const [configDocs, setConfigDocs] = useState({})
    const [liorenConfig, setLiorenConfig] = useState({})



    const setDocumentsTypes = (webConnection, liorenConfig, configDocs) => {
        console.log('Lioren config', liorenConfig)
        let docs = [
            { name: 'Ticket', label: 'Ticket' }
        ]
        let ticket = ticketDoc(webConnection, configDocs, liorenConfig.integration)
        if (ticket) docs.push({ name: 'Boleta', label: 'Boleta' })

        //-----//
        docs.push({ name: 'Sin impresora', label: 'Sin impresora' })
        setDocumentTypesList(docs)
    }


    useEffect(() => {
        if (openChangeDialog === true) {
            const handleKeyDown = (event) => {
                if (event.key === " ") {
                    dispatch({ type: 'CLEAR_CART' })
                    setOpen(false)
                    setOpenChangeDialog(false)
                }
            }
            document.addEventListener("keydown", handleKeyDown);
            return () => {
                document.removeEventListener("keydown", handleKeyDown);
            }
        }
    }, [openChangeDialog])

    useEffect(() => {
        let paymentMethods = ipcRenderer.sendSync('get-payment-methods', 'sync')
        let customerCredit = ipcRenderer.sendSync('get-customer-credit', 'sync')
        let printer = ipcRenderer.sendSync('get-printer', 'sync')
        let ticket_info = ipcRenderer.sendSync('get-ticket-info', 'sync')
        let docs = ipcRenderer.sendSync('get-docs', 'sync')
        let lioren = ipcRenderer.sendSync('get-lioren', 'sync')
        paymentMethods = paymentMethods.map((method) => {
            return { name: method.name, label: method.name }
        })
        customerCredit.state === true ? paymentMethods.unshift({ name: 'customerCredit', label: customerCredit.name }) : null
        paymentMethods.unshift({ name: 'Efectivo', label: 'Efectivo' })
        setConfigDocs(docs)
        setPaymentMethodsList(paymentMethods)
        setPrinter(printer)
        setTicketInfo(ticket_info)
        setLiorenConfig(lioren)
        setDocumentsTypes(webConnection, lioren, docs)
    }, [])


    useEffect(() => {
        if (payAmount == 0) {
            setDisablePay(true)
        } else {
            if (payAmount < total) {
                setDisablePay(true)
            } else {
                setDisablePay(false)
                setChange(payAmount - total)
            }
        }
    }, [payAmount])

    useEffect(() => {
        if (open === false) {
            setPayAmount(0)
            setPaymentMethod('Efectivo')
        }
    }, [open])

    useEffect(() => {
        if (paymentMethod == 'Efectivo') {
            setPayAmount(0)
            setShowCustomerFinder(false)
        } else if (paymentMethod == 'customerCredit') {
            setPayAmount(total)
            setShowCustomerFinder(true)
        } else {
            setPayAmount(total)
            setShowCustomerFinder(false)
        }
    }, [paymentMethod])

    const addDigit = digit => {
        let amount = payAmount.toString()
        if (amount === '0' && digit === 0) {
            setPayAmount(0);
        } else if (amount.length >= 7) {
            setPayAmount(parseInt(amount))
        } else {
            amount += digit.toString();
            setPayAmount(parseInt(amount))
        }
    }

    const removeDigit = () => {
        let amount = payAmount.toString();
        if (amount.length === 1) {
            setPayAmount(0);
        } else {
            amount = amount.slice(0, -1);
            setPayAmount(parseInt(amount))
        }
    }

    const updateStocks = (cart) => {
        let newStocks = []
        cart.map(product => {
            newStocks.push(stocks.updateByProductAndStorage(product.id, 1001, product.virtualStock))
        })
        return Promise.all(newStocks)
    }

    const printTicket = () => {
        const pr = new Promise((resolve, reject) => {
            print.ticket(total, cart, ticketInfo, printer)
                .then(() => { resolve() })
                .catch(err => {
                    console.log(err)
                    dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'Error de conexión con la impresora' } })
                    reject(err)
                })
        })
        return pr
    }

    const sale = () => {
        const pr = new Promise((resolve, reject) => {
            sales.create(total, paymentMethod, 0, 0)
                .then(res => {
                    let movs = movements.movements
                    movs.push({
                        sale_id: res.id,
                        user: user.name,
                        type: 1004,
                        amount: total,
                        payment_method: paymentMethod,
                        balance: movements.balance + total,
                        dte_code: 0,
                        dte_number: 0,
                        date: new Date()
                    })
                    let newMov = {
                        state: true,
                        balance: movements.balance + total,
                        movements: movs
                    }
                    ipcRenderer.send('update-movements', newMov)
                    dispatch({ type: 'SET_MOVEMENTS', value: newMov })
                    resolve()

                })
                .catch(err => {
                    console.log(err)
                    reject(err)
                })
        })
        return pr
    }

    const stockControlPayTrue = () => {
        const pay = new Promise((resolve, reject) => {
            updateStocks(cart)
                .then(() => {
                    stocks.findAllStockAlert()
                        .then(res => {
                            dispatch({ type: 'SET_STOCK_ALERT_LIST', value: res })
                            resolve()
                        })
                        .catch(err => {
                            console.log(err)
                            reject(err)
                        })
                })
                .catch(err => {
                    console.log(err)
                    reject(err)
                })
        })
        return pay
    }

    const stockControlPayFalse = () => {
        const pay = new Promise((resolve, reject) => {
            console.log('sin stock')
            resolve()
        })
        return pay
    }


    const pay = async () => {
        console.log('Doc', documentType)
        switch (documentType) {
            case 'Ticket':
                console.log('ticket')
                //const findPrinter = await ipcRenderer.invoke('find-printer', printer)
                if (ipcRenderer.invoke('find-printer', printer)) {
                    console.log('testPrint', printer)
                    if (stockControl == true) {
                        await updateStocks(cart)
                        const stockAlertList = await stocks.findAllStockAlert()
                        dispatch({ type: 'SET_STOCK_ALERT_LIST', value: stockAlertList })
                        await sale()
                        let date = moment(new Date()).format('DD-MM-yyyy')
                        let time = moment(new Date()).format('HH:mm')
                        let printInfo = {
                            total: total,
                            cart: cart,
                            printer: printer,
                            ticketInfo: ticketInfo,
                            date: date, time: time,
                            paymentMethod: paymentMethod,
                        }
                        console.log('printInfo', printInfo)
                        ipcRenderer.sendSync('print-ticket', printInfo)
                        setOpen(false)
                        setOpenChangeDialog(true)

                    } else {
                        await sale()
                        let date = moment(new Date()).format('DD-MM-yyyy')
                        let time = moment(new Date()).format('HH:mm')
                        let printInfo = {
                            total: total,
                            cart: cart,
                            printer: printer,
                            ticketInfo: ticketInfo,
                            date: date, time: time,
                            paymentMethod: paymentMethod,
                        }
                        ipcRenderer.sendSync('print-ticket', printInfo)
                        setOpen(false)
                        setOpenChangeDialog(true)
                    }
                } else {
                    dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'Error de conexión con la impresora' } })
                }
                break
            case 'Boleta':
                console.log('Boleta')
                if (await ipcRenderer.invoke('find-printer', printer) == true) {
                    if (stockControl == true) {
                        await updateStocks(cart)
                        const stockAlertList = await stocks.findAllStockAlert()
                        dispatch({ type: 'SET_STOCK_ALERT_LIST', value: stockAlertList })
                        await sale()
                        let date = moment(new Date()).format('DD-MM-yyyy')
                        let time = moment(new Date()).format('HH:mm')
                        lioren.boleta(liorenConfig.token, total)
                            .catch(err => { dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'Error de conexión con Lioren' } }) })
                            .then(data => {
                                let timbre = data[0]
                                let canvas = document.createElement('canvas')
                                PDF417.draw(timbre, canvas, 2, 2, 1.5)
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
                                    total: total,
                                    iva: data[1],
                                    invoiceNumber: data[2],
                                    cart: cart,
                                }
                                ipcRenderer.sendSync('boleta', printInfo)
                                setOpen(false)
                                setOpenChangeDialog(true)
                            })
                    } else {
                        await sale()
                        let date = moment(new Date()).format('DD-MM-yyyy')
                        let time = moment(new Date()).format('HH:mm')
                        lioren.boleta(liorenConfig.token, total)
                            .catch(err => { dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'Error de conexión con Lioren' } }) })
                            .then(data => {
                                let timbre = data[0]
                                let canvas = document.createElement('canvas')
                                PDF417.draw(timbre, canvas, 2, 2, 1.5)
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
                                    total: total,
                                    iva: data[1],
                                    invoiceNumber: data[2],
                                    cart: cart,
                                }
                                ipcRenderer.sendSync('boleta', printInfo)
                                setOpen(false)
                                setOpenChangeDialog(true)
                            })
                    }
                } else {
                    dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'Error de conexión con la impresora' } })
                }
                break



                break
            case 'Sin impresora':
                try {
                    if (stockControl == true) {
                        await updateStocks(cart)
                        const stockAlertList = await stocks.findAllStockAlert()
                        dispatch({ type: 'SET_STOCK_ALERT_LIST', value: stockAlertList })
                        await sale()
                        setOpen(false)
                        setOpenChangeDialog(true)


                    } else {
                        await sale()
                        setOpen(false)
                        setOpenChangeDialog(true)
                    }
                } catch (err) {
                    if (err === 'printer Error') {
                        dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'Error de conexión con la impresora' } })
                    } else {
                        dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'Error durante el proceso' } })
                    }

                }
                break
            default:
                console.log('default')
                break
        }

    }

    return (
        <>
            <Dialog open={open} maxWidth={'xs'} >
                <form onSubmit={(e) => { e.preventDefault(); pay() }}>
                    <DialogTitle sx={{ p: 2 }}>
                        Proceso de pago
                    </DialogTitle>
                    <DialogContent sx={{ p: 2 }}>
                        <Grid container spacing={1} direction={'column'}>
                            <Grid item marginTop={1}>
                                <TextField
                                    label="Total:"
                                    value={utils.renderMoneystr(total)}
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item marginTop={1}>
                                <TextField
                                    label="Paga con:"
                                    name='inputPayAmount'
                                    value={utils.renderMoneystr(payAmount)}
                                    onChange={(e) => { e.target.value === '$ ' || e.target.value === '$' || e.target.value === '0' || e.target.value === '' ? setPayAmount(0) : setPayAmount(utils.moneyToInt(e.target.value)) }}
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                    autoFocus
                                />
                            </Grid>
                            <Grid item textAlign={'right'} sx={{ display: disablePay ? 'block' : 'none' }}>
                                <Typography color={'error'}>{'Monto de pago insuficiente'}</Typography>
                            </Grid>
                            <Grid item textAlign={'right'} sx={{ display: disablePay ? 'none' : 'block' }}>
                                <Typography color={'pimary'}>{'Vuelto: ' + utils.renderMoneystr(change)}</Typography>
                            </Grid>
                            <Grid item>
                                <Grid container spacing={1}>
                                    <Grid item xs={4} sm={4} md={4}>
                                        <Button sx={{ height: '100%', width: '100%' }} variant={'contained'} onClick={() => { addDigit(1) }}>1</Button>
                                    </Grid>
                                    <Grid item s={4} sm={4} md={4}>
                                        <Button sx={{ height: '100%', width: '100%' }} variant={'contained'} onClick={() => { addDigit(2) }}>2</Button>
                                    </Grid>
                                    <Grid item s={4} sm={4} md={4}>
                                        <Button sx={{ height: '100%', width: '100%' }} variant={'contained'} onClick={() => { addDigit(3) }}>3</Button>
                                    </Grid>
                                    <Grid item xs={4} sm={4} md={4}>
                                        <Button sx={{ height: '100%', width: '100%' }} variant={'contained'} onClick={() => { addDigit(4) }}>4</Button>
                                    </Grid>
                                    <Grid item s={4} sm={4} md={4}>
                                        <Button sx={{ height: '100%', width: '100%' }} variant={'contained'} onClick={() => { addDigit(5) }}>5</Button>
                                    </Grid>
                                    <Grid item s={4} sm={4} md={4}>
                                        <Button sx={{ height: '100%', width: '100%' }} variant={'contained'} onClick={() => { addDigit(6) }}>6</Button>
                                    </Grid>
                                    <Grid item xs={4} sm={4} md={4}>
                                        <Button sx={{ height: '100%', width: '100%' }} variant={'contained'} onClick={() => { addDigit(7) }}>7</Button>
                                    </Grid>
                                    <Grid item s={4} sm={4} md={4}>
                                        <Button sx={{ height: '100%', width: '100%' }} variant={'contained'} onClick={() => { addDigit(8) }}>8</Button>
                                    </Grid>
                                    <Grid item s={4} sm={4} md={4}>
                                        <Button sx={{ height: '100%', width: '100%' }} variant={'contained'} onClick={() => { addDigit(9) }}>9</Button>
                                    </Grid>
                                    <Grid item s={8} sm={8} md={8}>
                                        <Button sx={{ height: '100%', width: '100%' }} variant={'contained'} onClick={() => { addDigit(0) }}>0</Button>
                                    </Grid>
                                    <Grid item s={4} sm={4} md={4}>
                                        <Button sx={{ height: '100%', width: '100%' }} variant={'contained'} onClick={() => { removeDigit() }}><BackspaceIcon /></Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item marginTop={1}>
                                <Grid container spacing={1}>
                                    <Grid item xs={6} sm={6} md={6}>
                                        <Grid item paddingBottom={2}>
                                            <AppPaper title={'Medio de pago'} sx={{ height: '100%' }}>
                                                <FormGroup sx={{ p: 1 }}>
                                                    {paymentMethodsList.map(item => (
                                                        <FormControlLabel
                                                            key={item.name}
                                                            control={
                                                                <Checkbox
                                                                    checked={paymentMethod === item.name}
                                                                    onChange={(e) => { setPaymentMethod(e.target.name) }}
                                                                    name={item.name}
                                                                    color="primary"
                                                                    size="small"
                                                                />
                                                            }
                                                            label={<span style={{ fontSize: '12px' }}>{item.label}</span>}
                                                            style={{ marginBottom: '-12px' }}
                                                        />
                                                    ))}
                                                </FormGroup>
                                            </AppPaper>
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={6} sm={6} md={6} height={'100%'}>
                                        <AppPaper title={'Documento'} sx={{ height: '100%' }}>
                                            <FormGroup sx={{ p: 1 }}>
                                                {documentTypesList.map(item => (
                                                    <FormControlLabel
                                                        key={item.name}
                                                        control={
                                                            <Checkbox
                                                                checked={documentType === item.name}
                                                                onChange={(e) => { setDocumentType(e.target.name) }}
                                                                name={item.name}
                                                                color="primary"
                                                                size="small"
                                                            />
                                                        }
                                                        label={<span style={{ fontSize: '12px' }}>{item.label}</span>}
                                                        style={{ marginBottom: '-12px' }}
                                                    />
                                                ))}

                                            </FormGroup>
                                        </AppPaper>
                                    </Grid>
                                </Grid>
                                <Grid item sx={{ display: showCustomerFinder ? 'block' : 'none', }} paddingTop={2}>
                                    <Grid container spacing={1} >
                                        <Grid item xs={10} sm={10} md={10} lg={10}>
                                            {/* <Autocomplete
                                                inputValue={customerInput}
                                                onInputChange={(e, newInputValue) => {
                                                    setCustomerInput(newInputValue)
                                                }}
                                                value={customer}
                                                onChange={(e, newValue) => {
                                                    setCustomer(newValue)
                                                }}
                                                isOptionEqualToValue={(option, value) => value === null || option.id === value.id}
                                                disablePortal
                                                noOptionsText="Cliente no encontrado"
                                                options={customersOptions}
                                                renderInput={(params) => <TextField {...params} label='Cliente' size={'small'} fullWidth required name='customer'/>}
                                            /> */}
                                        </Grid>
                                        <Grid item xs={2} sm={2} md={2} lg={2}>
                                            <IconButton onClick={() => { setOpenNewCustomerDialog(true) }}><AddCircleIcon /> </IconButton>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>


                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button variant={'contained'} disabled={disablePay} type='submit'>Pagar</Button>
                        <Button onClick={() => setOpen(false)}>Cerrar</Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={openChangeDialog} fullWidth maxWidth={'xs'}>
                <DialogTitle sx={{ p: 2 }}>Resumen venta</DialogTitle>
                <DialogContent sx={{ p: 2 }}>
                    <Grid container spacing={1} direction={'column'}>
                        <Grid item marginTop={1}>
                            <TextField
                                label="Total:"
                                value={utils.renderMoneystr(total)}
                                InputProps={{
                                    readOnly: true,
                                }}
                                variant="outlined"
                                size={'small'}
                                fullWidth

                            />
                        </Grid>
                        <Grid item marginTop={1}>
                            <TextField
                                label="Vuelto:"
                                value={utils.renderMoneystr(change)}
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
                    <Button variant={'outlined'} onClick={() => { setOpenChangeDialog(false); dispatch({ type: 'CLEAR_CART' }) }}>Cerrar</Button>
                </DialogActions>
            </Dialog>

        </>

    )
}





function ticketDoc(webConnection, docs, liorenIntegration) {
    console.log('connnn', webConnection)
    console.log('docs', docs)
    console.log('integration', liorenIntegration)
    if (!webConnection) {
        return false
    } else if (!liorenIntegration) {
        return false
    } else if (!docs.ticket) {
        return false
    } else {
        return true
    }
}