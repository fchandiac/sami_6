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
const ipcRenderer = electron.ipcRenderer || false

const utils = require('../../../utils')
const print = require('../../../promises/print')
const stocks = require('../../../promises/stocks')
const sales = require('../../../promises/sales')


export default function PayDialog(props) {
    const { open, setOpen, total, stockControl } = props
    const { dispatch, cart, movements, user } = useAppContext()
    const [payAmount, setPayAmount] = useState(0)
    const [change, setChange] = useState(0)
    const [disablePay, setDisablePay] = useState(true)
    const [openChangeDialog, setOpenChangeDialog] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState('Efectivo')
    const [paymentMethodsList, setPaymentMethodsList] = useState([])
    const [printerInfo, setPrinterInfo] = useState({ idProduct: 0, idVendor: 0 })
    const [ticketInfo, setTicketInfo] = useState({ name: '', address: '', phone: '', rut: '' })
    const [showCustomerFinder, setShowCustomerFinder] = useState(false)
    const [customersOptions, setCustomersOptions] = useState([])
    const [customerInput, setCustomerInput] = useState('')
    const [customer, setCustomer] = useState(null)
    const [documentType, setDocumentType] = useState('Ticket')

    const documentTypesList = [
        { name: 'Ticket', label: 'Ticket' },
        // { name: 'Boleta', label: 'Boleta' },
        { name: 'Sin impresora', label: 'Sin impresora' }
    ]

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
        let print_info = ipcRenderer.sendSync('get-printer', 'sync')
        let ticket_info = ipcRenderer.sendSync('get-ticket-info', 'sync')
        paymentMethods = paymentMethods.map((method) => {
            return { name: method.name, label: method.name }
        })
        customerCredit.state === true ? paymentMethods.unshift({ name: 'customerCredit', label: customerCredit.name }) : null
        paymentMethods.unshift({ name: 'Efectivo', label: 'Efectivo' })
        setPaymentMethodsList(paymentMethods)
        setPrinterInfo(print_info)
        setTicketInfo(ticket_info)
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
            print.ticket(total, cart, ticketInfo, printerInfo)
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
                    console.log(newMov)
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



    const pay = () => {
        switch (documentType) {
            case 'Ticket':
                console.log('ticket')
                print.test(printerInfo)
                    .then(() => {
                        if (stockControl == true) {
                            stockControlPayTrue()
                                .then(() => {
                                    sale()
                                        .then(() => {
                                            printTicket()
                                                .then(() => {
                                                    setOpen(false)
                                                    setOpenChangeDialog(true)
                                                })
                                        })
                                        .catch(err => { console.error(err) })
                                })
                                .catch(err => { console.error(err) })

                        } else {
                            stockControlPayFalse()
                                .then(() => {
                                    sale()
                                        .then(() => {
                                            printTicket()
                                                .then(() => {
                                                    setOpen(false)
                                                    setOpenChangeDialog(true)
                                                })
                                        })
                                        .catch(err => { console.error(err) })
                                })
                                .catch(err => { console.error(err) })
                        }
                    })
                    .catch(err => {
                        dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'Error de conexión con la impresora' } })
                        console.error(err)
                    })

                break
            case 'Boleta':
                console.log('boleta')
                break
            case 'Sin impresora':
                if (stockControl == true) {
                    stockControlPayTrue()
                        .then(() => {
                            sale()
                                .then(() => {
                                    setOpen(false)
                                    setOpenChangeDialog(true)
                                })
                                .catch(err => { console.error(err) })
                        })
                        .catch(err => { console.error(err) })
                } else {
                    stockControlPayFalse()
                        .then(() => {
                            sale()
                                .then(() => {
                                    setOpen(false)
                                    setOpenChangeDialog(true)
                                })
                                .catch(err => { console.error(err) })
                        })
                        .catch(err => { console.error(err) })
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


