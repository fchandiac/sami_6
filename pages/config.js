import { React, useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Button, Grid, TextField, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Switch, FormControlLabel } from '@mui/material'
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
    const [customerCredit, setCustomerCredit] = useState({ 'name': '', 'state': true })
    const [newPaymentMethod, setNewPaymentMethod] = useState('')
    const [adminPass, setAdminPass] = useState('')
    const [cashRegisterUI, setCashRegisterUI] = useState({ 'stock_control': true })

    useEffect(() => {
        const readConfig = ipcRenderer.sendSync('read-config', 'sync');
        //console.log(readConfig)
        setConfig(readConfig)
        setPaymentMethods(readConfig.payment_methods)
        setCustomerCredit(readConfig.customer_credit)
        setAdminPass(readConfig.admin_pass)
        setCashRegisterUI(readConfig.cash_register_UI)
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
        dispatch({ type: 'OPEN_SNACK', value: { type: 'success', message: 'Configuración de caja actualizada' } })
    }

    return (
        <>
            <Grid container spacing={1}>
                <Grid item>
                    <AppPaper title='Base de Datos'>
                        <Grid container spacing={1} direction={'column'} p={1}>
                            <Grid item>

                            </Grid>

                        </Grid>
                    </AppPaper>
                </Grid>
                <Grid item>
                    <AppPaper title='Medios de pago alternativos'>
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
                <Grid item>
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
                <Grid item>
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
                <Grid item>
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
