import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, Paper, Typography, TextField,
    FormGroup, FormControlLabel, Checkbox, Autocomplete, RadioGroup, Radio, IconButton, Box
} from '@mui/material'
import {
    DataGrid,
    esES,
    GridToolbarQuickFilter,
    useGridApiContext,
    useGridSelector,
    gridPageSelector,
    gridPageCountSelector,
} from '@mui/x-data-grid'
import React, { useState, useEffect, useRef } from 'react'
import BackspaceIcon from '@mui/icons-material/Backspace'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import LockOpenTwoToneIcon from '@mui/icons-material/LockOpenTwoTone'
import LockTwoToneIcon from '@mui/icons-material/LockTwoTone'
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle'
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined'
import EditIcon from '@mui/icons-material/Edit'
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart'
import { GridActionsCellItem } from '@mui/x-data-grid'
import electron from 'electron'
import { useAppContext } from '../../AppProvider'
import AppPaper from '../AppPaper/AppPaper'
import AppErrorSnack from '../AppErrorSnack'
const ipcRenderer = electron.ipcRenderer || false
const utils = require('../../utils')
const print = require('../../promises/print')

export default function ShoppingCart() {
    const payAmountRef = useRef(null)
    const { cart, total, lock, dispatch } = useAppContext()
    const [rowData, setRowData] = useState([])
    const [payAmount, setPayAmount] = useState(0)
    const [openPayDialog, setOpenPayDialog] = useState(false)
    const [openNewCustomerDialog, setOpenNewCustomerDialog] = useState(false)
    const [openEditQuantyDialog, setOpenEditQuantyDialog] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState('Efectivo') // sera una props ?
    const [paymentMethodsList, setPaymentMethodsList] = useState([])
    const [showCustomerFinder, setShowCustomerFinder] = useState(false)
    const [customersOptions, setCustomersOptions] = useState([])
    const [customerInput, setCustomerInput] = useState('')
    const [customer, setCustomer] = useState(null)
    const [documentType, setDocumentType] = useState('Ticket')
    const [openDiscountDialog, setOpenDiscountDialog] = useState(false)
    const [openAuthDialog, setOpenAuthDialog] = useState(false)
    const [adminPass, setAdminPass] = useState('')
    const [checkPass, setCheckPass] = useState('')
    const [discount, setDiscount] = useState(0)
    const [disablePay, setDisablePay] = useState(true)
    const [change, setChange] = useState(0)
    const [openChangeDialog, setOpenChangeDialog] = useState(false)


    const documentTypesList = [
        { name: 'Ticket', label: 'Ticket' },
        { name: 'Boleta', label: 'Boleta' },
        { name: 'Sin impresora', label: 'Sin impresora' }
    ]

    useEffect(() => {
        let paymentMethods = ipcRenderer.sendSync('get-payment-methods', 'sync')
        let customerCredit = ipcRenderer.sendSync('get-customer-credit', 'sync')
        let adminPass = ipcRenderer.sendSync('get-admin-pass', 'sync')
        paymentMethods = paymentMethods.map((method) => {
            return { name: method.name, label: method.name }
        })
        paymentMethods.unshift({ name: 'customerCredit', label: customerCredit.name })
        paymentMethods.unshift({ name: 'Efectivo', label: 'Efectivo' })
        setPaymentMethodsList(paymentMethods)
        setAdminPass(adminPass)
    }, [])

    useEffect(() => {
        if (payAmount < total) {
            setDisablePay(true)
        } else {
            setDisablePay(false)
            setChange(payAmount - total)
        }
    }, [payAmount])

    useEffect(() => {
        if (openPayDialog === false) {
            setPayAmount(0)
        }
    }, [openPayDialog])

    useEffect(() => {
        if (paymentMethod == 'Efectivo') {
            setPayAmount(0)
            setShowCustomerFinder(false)
        } else if (paymentMethod == 'customerCredit') {
            setPayAmount(total)
            payAmountRef.current.disabled = true
            setShowCustomerFinder(true)
        } else {
            setPayAmount(total)
            setShowCustomerFinder(false)
        }
    }, [paymentMethod])

    const removeProduct = (id) => {
        dispatch({ type: 'REMOVE_FROM_CART', value: id })
    }

    const substractProduct = (id) => {
        dispatch({ type: 'SUBSTRACT_QUANTY', value: id })
    }

    const addProduct = (id) => {
        dispatch({ type: 'ADD_QUANTY', value: id })
    }

    const editQuanty = (id, quanty) => {
        dispatch({ type: 'EDIT_QUANTY', value: { id, quanty } })
        setOpenEditQuantyDialog(false)
    }


    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' })
    }

    const addDiscount = (id) => {
        dispatch({ type: 'ADD_DISCOUNT', value: id })
    }

    const substractDiscount = (id) => {
        dispatch({ type: 'SUBSTRACT_DISCOUNT', value: id })
    }

    const proccessPayment = () => {
        if (cart.length === 0) {
            dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'No hay productos en el carrito' } })
        } else {
            setOpenPayDialog(true)
        }
    }

    const payment = () => {
        print.ticket(total, cart)
            .then(() => {
                setOpenPayDialog(false)
                setOpenChangeDialog(true)
            })
            .catch(err => {
                console.log(err)
                dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'Error de conexión con la impresora' } })
            })
    }

    const openDiscountUI = () => {
        if (cart.length === 0) {
            dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'No hay productos en el carrito' } })
        } else {
            setOpenDiscountDialog(true)
        }
    }

    const applyDiscount = (discount) => {
        dispatch({ type: 'GLOBAL_DISCOUNT', value: discount })
        setOpenDiscountDialog(false)
    }

    const updateLock = () => {
        console.log('adminPass', adminPass)
        console.log('lock', lock)
        if (lock === false) {
            if (checkPass == adminPass) {
                dispatch({ type: 'LOCK' })
                setOpenAuthDialog(false)
                setCheckPass('')
            } else {
                dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'Contraseña incorrecta' } })
                setCheckPass('')
            }
        } else {
            if (checkPass == adminPass) {
                dispatch({ type: 'UNLOCK' })
                setOpenAuthDialog(false)
                setCheckPass('')
            } else {
                dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'Contraseña incorrecta' } })
                setCheckPass('')
            }
        }

    }


    const columns = [
        { field: 'quanty', headerName: '#', flex: .5 },
        { field: 'name', headerName: 'Producto', flex: 1.8 },
        { field: 'sale', headerName: 'Precio', flex: 1, valueFormatter: (params) => (utils.renderMoneystr(params.value)) },
        {
            field: 'discount',
            headerName: 'Descuento',
            flex: 1.1,
            renderCell: (params) => (
                <>
                    <IconButton onClick={() => { substractDiscount(params.row.id) }}>
                        <RemoveCircleOutlineOutlinedIcon />
                    </IconButton>
                    {params.row.discount + '%'}
                    <IconButton onClick={() => { addDiscount(params.row.id) }}>
                        <AddCircleOutlineOutlinedIcon />
                    </IconButton>
                </>
            ),
            hide: lock ? true : false
        },
        { field: 'subTotal', headerName: 'Subtotal', flex: 1, valueFormatter: (params) => (utils.renderMoneystr(params.value)) },
        {
            field: 'actions',
            headerName: '',
            flex: 1,
            headerClassName: 'data-grid-last-column-header',
            type: 'actions', getActions: (params) => [
                <GridActionsCellItem
                    sx={{ paddingLeft: 0, paddingRight: 0 }}
                    label='delete'
                    icon={<DeleteIcon />}
                    onClick={() => {
                        removeProduct(params.row.id)
                    }}
                />,
                <GridActionsCellItem
                    sx={{ paddingLeft: 0, paddingRight: 0 }}
                    label='substract'
                    icon={<RemoveCircleIcon />}
                    onClick={() => {
                        substractProduct(params.row.id)
                    }}
                />,
                <GridActionsCellItem
                    sx={{ paddingLeft: 0, paddingRight: 0 }}
                    label='edit'
                    icon={<EditIcon />}
                    onClick={() => {
                        setRowData({
                            id: params.row.id,
                            quanty: params.row.quanty,
                            name: params.row.name,
                        })
                        setOpenEditQuantyDialog(true)
                    }}
                />,
                <GridActionsCellItem
                    sx={{ paddingLeft: 0, paddingRight: 0 }}
                    label='add'
                    icon={<AddCircleIcon />}
                    onClick={() => {
                        addProduct(params.row.id)
                    }}
                />,

            ]
        }
    ]


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

    return (
        <>
            <Paper elevation={0} variant="outlined" sx={{ height: '69.3vh' }}>
                        <DataGrid
                            localeText={esESGrid}
                            sx={{ border: 'none' }}
                            disableColumnMenu
                            rows={cart}
                            density='compact'
                            getRowHeight={() => 'auto'}
                            columns={columns}
                            components={{ Toolbar: CustomToolbar, Pagination: CustomFooter }}
                            componentsProps={{
                                toolbar: {
                                    total: utils.renderMoneystr(total)

                                },
                                pagination: {
                                    lock: lock,
                                    proccessPayment: proccessPayment, 
                                    openDiscountUI: openDiscountUI, 
                                    clearCart: clearCart,
                                    setOpenAuthDialog: setOpenAuthDialog

                                }

                            }}

                        />
       
            </Paper>
            <Dialog open={openPayDialog} maxWidth={'xs'} fullWidth>
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
                                inputRef={payAmountRef}
                                label="Paga con:"
                                value={utils.renderMoneystr(payAmount)}
                                onChange={(e) => {
                                    if (e.target.value === '$' || e.target.value === '0' || e.target.value === '') {
                                        setPayAmount(0)
                                    } else {
                                        setPayAmount(e.target.value)
                                    }
                                }}
                                variant="outlined"
                                size={'small'}
                                fullWidth
                            />
                        </Grid>
                        <Grid item textAlign={'right'} sx={{ display: disablePay ? 'blobk' : 'none' }}>
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
                                        <Autocomplete
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
                                            renderInput={(params) => <TextField {...params} label='Cliente' size={'small'} fullWidth required />}
                                        />
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
                    <Button variant={'contained'} disabled={disablePay} onClick={() => payment()}>Pagar</Button>
                    <Button variant={'outlined'} onClick={() => setOpenPayDialog(false)}>Cerrar</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openNewCustomerDialog} fullWidth maxWidth={'md'}>
                <DialogTitle>Nuevo cliente</DialogTitle>
                <DialogContent></DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => setOpenNewCustomerDialog(false)}>Cerrar</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openEditQuantyDialog} fullWidth maxWidth={'xs'}>
                <DialogTitle sx={{ p: 2 }}>Editar cantidad: {rowData.name}</DialogTitle>
                <form onSubmit={(e) => { e.preventDefault(); editQuanty(rowData.id, rowData.quanty) }}>
                    <DialogContent sx={{ p: 2 }}>
                        <Grid container spacing={1} direction={'column'}>
                            <Grid item marginTop={1}>
                                <TextField
                                    label="Cantidad"
                                    value={rowData.quanty}
                                    onChange={(e) => { setRowData({ ...rowData, quanty: e.target.value }) }}
                                    type="number"
                                    inputProps={{ step: "0.01", inputProps: { min: 0 } }}
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                />
                            </Grid>
                        </Grid>

                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button variant="contained" type='submit'>Editar</Button>
                        <Button variant={'outlined'} onClick={() => setOpenEditQuantyDialog(false)}>Cerrar</Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={openAuthDialog} fullWidth maxWidth={'xs'}>
                <DialogTitle sx={{ p: 2 }}>Autorización de administrador</DialogTitle>
                <form onSubmit={(e) => { e.preventDefault(); updateLock() }}>
                    <DialogContent sx={{ p: 2 }}>
                        <Grid container spacing={1} direction={'column'}>
                            <Grid item marginTop={1}>
                                <TextField
                                    label="Contraseña"
                                    value={checkPass}
                                    onChange={(e) => { setCheckPass(e.target.value) }}
                                    type="password"
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                    required
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button variant="contained" type='submit'>Autorizar</Button>
                        <Button variant={'outlined'} onClick={() => { setOpenAuthDialog(false) }}>cerrar</Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={openDiscountDialog} fullWidth maxWidth={'xs'}>
                <DialogTitle sx={{ p: 2 }}>Aplicar descuento global</DialogTitle>
                <form onSubmit={(e) => { e.preventDefault(); applyDiscount(discount) }}>
                    <DialogContent sx={{ p: 2 }}>
                        <Grid container spacing={1} direction={'column'}>
                            <Grid item marginTop={1}>
                                <TextField
                                    label="Descuento"
                                    value={discount}
                                    onChange={(e) => { setDiscount(e.target.value) }}
                                    type="number"
                                    inputProps={{ max: 100, min: 0 }}
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                    required
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button variant="contained" type='submit'>aplicar</Button>
                        <Button variant={'outlined'} onClick={() => { setOpenDiscountDialog(false) }}>cerrar</Button>
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
                    <Button variant={'outlined'} onClick={() => { setOpenChangeDialog(false); dispatch({ type: 'CLEAR_CART' }) }}>cerrar</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}


function CustomToolbar(props) {
    const { total } = props

    return (
        <Box sx={{ p: 2, m: 1 }}>
            <Typography variant="h5" gutterBottom component="div">{'Total: ' + total}</Typography>
        </Box>
    )
}

function CustomFooter(props) {
    const { lock, proccessPayment, openDiscountUI, clearCart, setOpenAuthDialog } = props

    return (
        <Grid container spacing={1} direction={'row'} justifyContent={'flex-end'} alignItems={'center'} paddingRight={1}>
            <Grid item>
                <Button variant="contained" onClick={() => { proccessPayment() }}>Procesar Pago</Button>
            </Grid>
            <Grid item>
                <Button variant={'outlined'} sx={{ display: lock ? 'none' : 'block' }} onClick={() => { openDiscountUI() }}>Descuento</Button>
            </Grid>
            <Grid item>
                <IconButton  onClick={() => { clearCart() }}><RemoveShoppingCartIcon /></IconButton>
            </Grid>
            <Grid item>
                <IconButton onClick={() => { setOpenAuthDialog(true) }}>
                    <LockOpenTwoToneIcon sx={{ display: lock ? 'none' : 'block' }} />
                    <LockTwoToneIcon sx={{ display: lock ? 'block' : 'none' }} />
                </IconButton>
            </Grid>
        </Grid>

    )
}

const esESGrid = {
    // Root
    noRowsLabel: 'Sin productos',
    noResultsOverlayLabel: 'Ningún resultado encontrado.',
    errorOverlayDefaultLabel: 'Ha ocurrido un error.',
    // Density selector toolbar button text
    toolbarDensity: 'Densidad',
    toolbarDensityLabel: 'Densidad',
    toolbarDensityCompact: 'Compacta',
    toolbarDensityStandard: 'Standard',
    toolbarDensityComfortable: 'Comoda',
    // Columns selector toolbar button text
    toolbarColumns: 'Columnas',
    toolbarColumnsLabel: 'Seleccionar columnas',
    // Filters toolbar button text
    toolbarFilters: 'Filtros',
    toolbarFiltersLabel: 'Mostrar filtros',
    toolbarFiltersTooltipHide: 'Ocultar filtros',
    toolbarFiltersTooltipShow: 'Mostrar filtros',
    toolbarFiltersTooltipActive: count => count > 1 ? `${count} filtros activos` : `${count} filtro activo`,
    // Quick filter toolbar field
    toolbarQuickFilterPlaceholder: 'Buscar...',
    toolbarQuickFilterLabel: 'Buscar',
    // toolbarQuickFilterDeleteIconLabel: 'Clear',
    // Export selector toolbar button text
    toolbarExport: 'Exportar',
    toolbarExportLabel: 'Exportar',
    toolbarExportCSV: 'Descargar como CSV',
    // toolbarExportPrint: 'Print',
    // toolbarExportExcel: 'Download as Excel',
    // Columns panel text
    columnsPanelTextFieldLabel: 'Columna de búsqueda',
    columnsPanelTextFieldPlaceholder: 'Título de columna',
    columnsPanelDragIconLabel: 'Reorder columna',
    columnsPanelShowAllButton: 'Mostrar todo',
    columnsPanelHideAllButton: 'Ocultar todo',
    // Filter panel text
    filterPanelAddFilter: 'Agregar filtro',
    filterPanelDeleteIconLabel: 'Borrar',
    // filterPanelLinkOperator: 'Logic operator',
    filterPanelOperators: 'Operadores',
    // TODO v6: rename to filterPanelOperator
    filterPanelOperatorAnd: 'Y',
    filterPanelOperatorOr: 'O',
    filterPanelColumns: 'Columnas',
    filterPanelInputLabel: 'Valor',
    filterPanelInputPlaceholder: 'Valor de filtro',
    // Filter operators text
    filterOperatorContains: 'contiene',
    filterOperatorEquals: 'es igual',
    filterOperatorStartsWith: 'comienza con',
    filterOperatorEndsWith: 'termina con',
    filterOperatorIs: 'es',
    filterOperatorNot: 'no es',
    filterOperatorAfter: 'es posterior',
    filterOperatorOnOrAfter: 'es en o posterior',
    filterOperatorBefore: 'es anterior',
    filterOperatorOnOrBefore: 'es en o anterior',
    filterOperatorIsEmpty: 'está vacío',
    filterOperatorIsNotEmpty: 'no esta vacío',
    filterOperatorIsAnyOf: 'es cualquiera de',
    // Filter values text
    filterValueAny: 'cualquiera',
    filterValueTrue: 'verdadero',
    filterValueFalse: 'falso',
    // Column menu text
    columnMenuLabel: 'Menú',
    columnMenuShowColumns: 'Mostrar columnas',
    columnMenuFilter: 'Filtro',
    columnMenuHideColumn: 'Ocultar',
    columnMenuUnsort: 'Desordenar',
    columnMenuSortAsc: 'Ordenar asc',
    columnMenuSortDesc: 'Ordenar desc',
    // Column header text
    columnHeaderFiltersTooltipActive: count => count > 1 ? `${count} filtros activos` : `${count} filtro activo`,
    columnHeaderFiltersLabel: 'Mostrar filtros',
    columnHeaderSortIconLabel: 'Ordenar',
    // Rows selected footer text
    //footerRowSelected: count => count > 1 ? `${count.toLocaleString()} filas seleccionadas` : `${count.toLocaleString()} fila seleccionada`,
    footerRowSelected: count => count > 1 ? '' : '',
    footerTotalRows: 'Filas Totales:',
    // Total visible row amount footer text
    footerTotalVisibleRows: (visibleCount, totalCount) => `${visibleCount.toLocaleString()} de ${totalCount.toLocaleString()}`,
    // Checkbox selection text
    // checkboxSelectionHeaderName: 'Checkbox selection',
    // checkboxSelectionSelectAllRows: 'Select all rows',
    // checkboxSelectionUnselectAllRows: 'Unselect all rows',
    // checkboxSelectionSelectRow: 'Select row',
    // checkboxSelectionUnselectRow: 'Unselect row',
    // Boolean cell text
    booleanCellTrueLabel: 'Si',
    booleanCellFalseLabel: 'No',
    // Actions cell more text
    actionsCellMore: 'más', // Column pinning text
    // pinToLeft: 'Pin to left',
    // pinToRight: 'Pin to right',
    // unpin: 'Unpin',
    // Tree Data
    // treeDataGroupingHeaderName: 'Group',
    // treeDataExpand: 'see children',
    // treeDataCollapse: 'hide children',
    // Grouping columns
    // groupingColumnHeaderName: 'Group',
    // groupColumn: name => `Group by ${name}`,
    // unGroupColumn: name => `Stop grouping by ${name}`,
    // Master/detail
    // detailPanelToggle: 'Detail panel toggle',
    // expandDetailPanel: 'Expand',
    // collapseDetailPanel: 'Collapse',
    // Row reordering text
    // rowReorderingHeaderName: 'Row reordering',

}