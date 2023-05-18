import { React, useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Button, Grid, TextField, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Switch, FormControlLabel, Stack } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import SaveIcon from '@mui/icons-material/Save'
import electron from 'electron'
import AppPaper from '../components/AppPaper/AppPaper'
import AppSuccessSnack from '../components/AppSuccessSnack/AppSuccessSnack'
const ipcRenderer = electron.ipcRenderer || false
import { useAppContext } from '../AppProvider'


export default function Home() {
    const { dispatch } = useAppContext()
    const [config, setConfig] = useState(configDataDefault())
    const [openNewPaymentMethod, setOpenNewPaymentMethod] = useState(false)
    const [paymentMethods, setPaymentMethods] = useState([])
    const [customerCredit, setCustomerCredit] = useState({ name: '', state: true })
    const [newPaymentMethod, setNewPaymentMethod] = useState('')
    const [adminPass, setAdminPass] = useState('')
    const [cashRegisterUI, setCashRegisterUI] = useState({ stock_control: true, quote: true, orders_mode: false, orders_loader: false, orders_priority: true, favorites: false, orders: true })
    const [printer, setPrinter] = useState({ idProduct: 0, idVendor: 0 })
    const [ticketInfo, setTicketInfo] = useState({ name: '', address: '', phone: '', rut: '' })
    const [apiUrl, setApiUrl] = useState('')
    const [docs, setDocs] = useState({ simple_ticket: true, ticket: true, invoice: true, change_ticket: true })
    const [lioren, setLioren] = useState({
        integration: true,
        token: '',
        mail: ''
    })

    useEffect(() => {
        const readConfig = ipcRenderer.sendSync('read-config', 'sync');
        //console.log(readConfig)
        setConfig(readConfig)
        setPaymentMethods(readConfig.payment_methods)
        setCustomerCredit(readConfig.customer_credit)
        setAdminPass(readConfig.admin_pass)
        setCashRegisterUI(readConfig.cash_register_UI)
        setPrinter(readConfig.printer)
        setTicketInfo(readConfig.ticket_info)
        setApiUrl(readConfig.api.url)
        setDocs(readConfig.docs)
        setLioren(readConfig.lioren)
        console.log(readConfig.api.url)
    }, [])


    const DeletePaymentMethod = (index) => {
        const newMethods = [...paymentMethods]
        newMethods.splice(index, 1)
        setPaymentMethods(newMethods)
    }

    const AddPaymentMethod = () => {
        const newMethods = [...paymentMethods]
        newMethods.push({ name: newPaymentMethod })
        setPaymentMethods(newMethods)
        setNewPaymentMethod('')
        setOpenNewPaymentMethod(false)
    }

    const updatePaymentMethods = () => {
        ipcRenderer.send('update-payment-methods', paymentMethods)
        dispatch({ type: 'OPEN_SNACK', value: { type: 'success', message: 'Medios de pago actualizados' } })
    }

    const updateCustomerCredit = () => {
        ipcRenderer.send('update-customer-credit', customerCredit)
        dispatch({ type: 'OPEN_SNACK', value: { type: 'success', message: 'Crédito de cliente actualizado' } })
    }

    const updateAdminPass = () => {
        ipcRenderer.send('update-admin-pass', adminPass)
        dispatch({ type: 'OPEN_SNACK', value: { type: 'success', message: 'Contraseña de administrador actualizada' } })
    }

    const updateCashRegisterUI = () => {
        ipcRenderer.send('update-cash-register-UI', cashRegisterUI)
        dispatch({ type: 'SET_ORDERS_MODE', value: cashRegisterUI.orders_mode })
        dispatch({ type: 'OPEN_SNACK', value: { type: 'success', message: 'Configuración de caja actualizada' } })
    }

    const updatePrinter = () => {
        ipcRenderer.send('update-printer', printer)
        dispatch({ type: 'OPEN_SNACK', value: { type: 'success', message: 'Impresora actualizada' } })
    }

    const updateTicketInfo = () => {
        ipcRenderer.send('update-ticket-info', ticketInfo)
        dispatch({ type: 'OPEN_SNACK', value: { type: 'success', message: 'Información de ticket actualizada' } })
    }

    const updateApiUrl = () => {
        ipcRenderer.send('update-api-url', apiUrl)
        dispatch({ type: 'OPEN_SNACK', value: { type: 'success', message: 'URL de API actualizada' } })
    }

    const updateDocs = () => {
        ipcRenderer.send('update-docs', docs)
        dispatch({ type: 'OPEN_SNACK', value: { type: 'success', message: 'Documentos actualizados' } })
    }

    const updateLioren = () => {
        ipcRenderer.send('update-lioren', lioren)
        dispatch({ type: 'OPEN_SNACK', value: { type: 'success', message: 'Integración Lioren actualizada' } })
    }

    const findPrinter = async () => {
        const findPrinter = await ipcRenderer.invoke('find-printer', printer)
        if (findPrinter) {
            alert('Impresora encontrada')
        } else {
            alert('Impresora no encontrada')
        }
    }

    return (
        <>
            <Grid container spacing={1}>
                <Grid item md={3}>
                    <AppPaper title='Api'>
                        <form onSubmit={(e) => { e.preventDefault(); updateApiUrl() }}>
                            <Grid container spacing={1} direction={'column'} p={1}>
                                <Grid item>
                                    <TextField
                                        label='url'
                                        value={apiUrl}
                                        onChange={(e) => { setApiUrl(e.target.value) }}
                                        variant="outlined"
                                        size={'small'}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item textAlign={'right'}>
                                    <IconButton color='primary' type='submit'>
                                        <SaveIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </form>
                    </AppPaper>
                </Grid>

                <Grid item md={3}>
                    <AppPaper title='Credito clientes'>
                        <form onSubmit={(e) => { e.preventDefault(); updateCustomerCredit() }}>
                            <Grid container spacing={1} direction={'column'} p={1}>
                                <Grid item>
                                    <TextField
                                        label='Nombre'
                                        value={customerCredit.name}
                                        onChange={(e) => { setCustomerCredit({ ...customerCredit, name: e.target.value }) }}
                                        variant="outlined"
                                        size={'small'}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item textAlign={'right'}>
                                    <Switch
                                        checked={customerCredit.state}
                                        onChange={(e) => { setCustomerCredit({ ...customerCredit, state: e.target.checked }) }}
                                    />
                                    <IconButton color='primary' type='submit'>
                                        <SaveIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </form>
                    </AppPaper>
                </Grid>

                <Grid item md={3}>
                    <AppPaper title='Contraseña Administrador'>
                        <form onSubmit={(e) => { e.preventDefault(); updateAdminPass() }}>
                            <Grid container spacing={1} direction={'column'} p={1}>
                                <Grid item>
                                    <TextField
                                        label='Contraseña'
                                        value={adminPass}
                                        onChange={(e) => { setAdminPass(e.target.value) }}
                                        variant="outlined"
                                        type='password'
                                        size={'small'}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item textAlign={'right'}>
                                    <IconButton color='primary' type='submit'>
                                        <SaveIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </form>
                    </AppPaper>
                </Grid>

                <Grid item md={3}>
                    <AppPaper title='Caja UI'>
                        <form onSubmit={(e) => { e.preventDefault(); updateCashRegisterUI() }}>
                            <Grid container spacing={1} direction={'column'} p={1}>
                                <Grid item>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={cashRegisterUI.stock_control}
                                                onChange={(e) => { setCashRegisterUI({ ...cashRegisterUI, stock_control: e.target.checked }) }}
                                            />
                                        }
                                        label="Control de Stock"
                                    />
                                </Grid>
                                <Grid item>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={cashRegisterUI.quote}
                                                onChange={(e) => { setCashRegisterUI({ ...cashRegisterUI, quote: e.target.checked }) }}
                                            />
                                        }
                                        label="Cotización"
                                    />
                                </Grid>
                                <Grid item>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={cashRegisterUI.orders_mode}
                                                onChange={(e) => { setCashRegisterUI({ ...cashRegisterUI, orders_mode: e.target.checked }) }}
                                            />
                                        }
                                        label="Modo pedidos"
                                    />
                                </Grid>
                                <Grid item>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={cashRegisterUI.orders_loader}
                                                onChange={(e) => { setCashRegisterUI({ ...cashRegisterUI, orders_loader: e.target.checked }) }}
                                            />
                                        }
                                        label="Cargar pedidos"
                                    />
                                </Grid>
                                <Grid item>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={cashRegisterUI.orders_priority}
                                                onChange={(e) => { setCashRegisterUI({ ...cashRegisterUI, orders_priority: e.target.checked }) }}
                                            />
                                        }
                                        label="Prioridad pedidos"
                                    />
                                </Grid>
                                <Grid item>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={cashRegisterUI.orders}
                                                onChange={(e) => { setCashRegisterUI({ ...cashRegisterUI, orders: e.target.checked }) }}
                                            />
                                        }
                                        label="Pedidos"
                                    />
                                </Grid>
                                <Grid item>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={cashRegisterUI.favorites}
                                                onChange={(e) => { setCashRegisterUI({ ...cashRegisterUI, favorites: e.target.checked }) }}
                                            />
                                        }
                                        label="Favoritos"
                                    />
                                </Grid>

                                <Grid item>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={cashRegisterUI.number_pad}
                                                onChange={(e) => { setCashRegisterUI({ ...cashRegisterUI, number_pad: e.target.checked }) }}
                                            />
                                        }
                                        label="Teclado numérico"
                                    />
                                </Grid>

                                <Grid item textAlign={'right'}>
                                    <IconButton color='primary' type='submit'>
                                        <SaveIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </form>
                    </AppPaper>
                </Grid>

                <Grid item md={3}>
                    <AppPaper title='Impresora'>
                        <form onSubmit={(e) => { e.preventDefault(); updatePrinter() }}>
                            <Grid container spacing={1} direction={'column'} p={1}>
                                <Grid item>
                                    <TextField
                                        label='id vendor'
                                        value={printer.idVendor}
                                        onChange={(e) => { setPrinter({ ...printer, idVendor: e.target.value }) }}
                                        variant="outlined"
                                        size={'small'}
                                        fullWidth
                                        required
                                    />

                                </Grid>
                                <Grid item>
                                    <TextField
                                        label='id profuct'
                                        value={printer.idProduct}
                                        onChange={(e) => { setPrinter({ ...printer, idProduct: e.target.value }) }}
                                        variant="outlined"
                                        size={'small'}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item textAlign={'right'}>
                                    <Stack direction="row" spacing={1} justifyContent={'space-between'}>
                                        <Button variant="outlined" onClick={() => findPrinter()}>Probar conexión</Button>
                                        <IconButton color='primary' type='submit'>
                                            <SaveIcon />
                                        </IconButton>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </form>
                    </AppPaper>
                </Grid>

                <Grid item md={3}>
                    <AppPaper title='Información Ticket'>
                        <form onSubmit={(e) => { e.preventDefault(); updateTicketInfo() }}>
                            <Grid container spacing={1} direction={'column'} p={1}>
                                <Grid item>
                                    <TextField
                                        label='Nombre'
                                        value={ticketInfo.name}
                                        onChange={(e) => { setTicketInfo({ ...ticketInfo, name: e.target.value }) }}
                                        variant="outlined"
                                        size={'small'}
                                        fullWidth
                                        required
                                    />

                                </Grid>
                                <Grid item>
                                    <TextField
                                        label='Rut'
                                        value={ticketInfo.rut}
                                        onChange={(e) => { setTicketInfo({ ...ticketInfo, rut: e.target.value }) }}
                                        variant="outlined"
                                        size={'small'}
                                        fullWidth
                                        required
                                    />

                                </Grid>
                                <Grid item>
                                    <TextField
                                        label='Dirección'
                                        value={ticketInfo.address}
                                        onChange={(e) => { setTicketInfo({ ...ticketInfo, address: e.target.value }) }}
                                        variant="outlined"
                                        size={'small'}
                                        fullWidth
                                        required
                                    />

                                </Grid>
                                <Grid item>
                                    <TextField
                                        label='Teléfono'
                                        value={ticketInfo.phone}
                                        onChange={(e) => { setTicketInfo({ ...ticketInfo, phone: e.target.value }) }}
                                        variant="outlined"
                                        size={'small'}
                                        fullWidth

                                    />

                                </Grid>
                                <Grid item textAlign={'right'}>
                                    <IconButton color='primary' type='submit'>
                                        <SaveIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </form>
                    </AppPaper>
                </Grid>

                <Grid item md={3}>
                    <AppPaper title='Medios de pago'>
                        <Grid container spacing={1} direction={'column'} p={1}>
                            <Grid item xs>
                                <Table>
                                    <TableBody>
                                        {paymentMethods.map((method, index) => (
                                            <TableRow key={index}>
                                                <TableCell component="th" scope="row" sx={{ fontSize: '14px', py: 0 }}>
                                                    {method.name}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton sx={{ p: 0 }} onClick={() => DeletePaymentMethod(index)}>
                                                        <DeleteIcon sx={{ fontSize: '16px' }} />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Grid>
                            <Grid item textAlign={'right'}>
                                <IconButton color='primary' onClick={() => { setOpenNewPaymentMethod(true) }}>
                                    <AddCircleIcon />
                                </IconButton>
                                <IconButton color='primary' onClick={() => { updatePaymentMethods() }}>
                                    <SaveIcon />
                                </IconButton>
                            </Grid>
                        </Grid>
                    </AppPaper>
                </Grid>

                <Grid item md={3}>
                    <AppPaper title='Documentos'>
                        <Grid container spacing={1} direction={'column'} p={1}>
                            <Grid item>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={docs.simple_ticket}
                                            onChange={(e) => { setDocs({ ...docs, simple_ticket: e.target.checked }) }}
                                        />
                                    }
                                    label="Ticket"
                                />
                            </Grid>
                            <Grid item>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={docs.ticket}
                                            onChange={(e) => { setDocs({ ...docs, ticket: e.target.checked }) }}
                                        />
                                    }
                                    label="Boleta"
                                />
                            </Grid>
                            <Grid item>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={docs.invoice}
                                            onChange={(e) => { setDocs({ ...docs, invoice: e.target.checked }) }}
                                        />
                                    }
                                    label="Factura"
                                />
                            </Grid>
                            <Grid item>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={docs.change_ticket}
                                            onChange={(e) => { setDocs({ ...docs, change_ticket: e.target.checked }) }}
                                        />
                                    }
                                    label="Ticket de cambio"
                                />
                            </Grid>
                            <Grid item textAlign={'right'}>
                                <IconButton color='primary' onClick={() => { updateDocs() }}>
                                    <SaveIcon />
                                </IconButton>
                            </Grid>
                        </Grid>
                    </AppPaper>
                </Grid>

                <Grid item md={3}>
                    <AppPaper title='Integración Lioren'>
                        <form onSubmit={(e) => { e.preventDefault(); updateLioren() }}>
                            <Grid container spacing={1} direction={'column'} p={1}>
                            <Grid item>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={lioren.integration}
                                                onChange={(e) => { setLioren({ ...lioren, integration: e.target.checked }) }}
                                            />
                                        }
                                        label="Integración"
                                    />
                                </Grid>
                                <Grid item>
                                    <TextField
                                        label='Token'
                                        value={lioren.token}
                                        onChange={(e) => { setLioren({ ...lioren, token: e.target.value }) }}
                                        variant="outlined"
                                        size={'small'}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item>
                                    <TextField
                                        label='Mail'
                                        value={lioren.mail}
                                        inputProps={{readOnly: true}}
                                        variant="outlined"
                                        size={'small'}
                                        fullWidth
                                        required
                                    />
                                </Grid>

                                <Grid item textAlign={'right'}>
                                        <IconButton color='primary' type='submit'>
                                            <SaveIcon />
                                        </IconButton>
                                </Grid>
                            </Grid>
                        </form>
                    </AppPaper>
                </Grid>

            </Grid>
            <Dialog open={openNewPaymentMethod} maxWidth={'xs'} fullWidth>
                <form onSubmit={(e) => { e.preventDefault(); AddPaymentMethod() }}>
                    <DialogTitle sx={{ p: 2 }}>
                        Nuevo medio de Pago
                    </DialogTitle>
                    <DialogContent sx={{ p: 2 }}>
                        <Grid container spacing={1} direction={'column'}>
                            <Grid item marginTop={1}>
                                <TextField
                                    label="Nombre"
                                    value={newPaymentMethod}
                                    onChange={(e) => { setNewPaymentMethod(e.target.value) }}
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                    required
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button variant={'contained'} type={'submit'}>Guardar</Button>
                        <Button variant={'outlined'} onClick={() => setOpenNewPaymentMethod(false)}>Cerrar</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    )
}

function configDataDefault() {
    return ({
        db_host: '',
        db_name: '',
        db_password: '',
        db_user: '',
        port_app: 0
    })
}
