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
import { ThemeProvider } from '@mui/material/styles'
import React, { useState, useEffect, useRef, forwardRef } from 'react'

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
import { useAppContext } from '../../AppProvider'
import AppPaper from '../AppPaper/AppPaper'
import PayDialog from './PayDialog/PayDialog'



import electron from 'electron'
const ipcRenderer = electron.ipcRenderer || false
const utils = require('../../utils')
const print = require('../../promises/print')
const stok = require('../../promises/stocks')



export default function ShoppingCart(props) {
    const { stockControl } = props
    const { cart, total, lock, dispatch } = useAppContext()
    const [rowData, setRowData] = useState([])
    const [openPayDialog, setOpenPayDialog] = useState(false)
    const [openNewCustomerDialog, setOpenNewCustomerDialog] = useState(false)
    const [openEditQuantyDialog, setOpenEditQuantyDialog] = useState(false)
    const [openDiscountDialog, setOpenDiscountDialog] = useState(false)
    const [openAuthDialog, setOpenAuthDialog] = useState(false)
    const [adminPass, setAdminPass] = useState('')
    const [checkPass, setCheckPass] = useState('')
    const [discount, setDiscount] = useState(0)


    useEffect(() => {
        let adminPass = ipcRenderer.sendSync('get-admin-pass', 'sync')
        setAdminPass(adminPass)
    }, [])


    const removeProduct = (id, salesRoomStock) => {
        dispatch({ type: 'REMOVE_FROM_CART', value: { id, salesRoomStock } })
    }

    const substractProduct = (id, salesRoomStock) => {
        dispatch({ type: 'SUBSTRACT_QUANTY', value: { id, salesRoomStock } })
    }

    const addProduct = (id, salesRoomStock) => {
        let product = cart.find((product) => product.id === id)
        if (product.virtualStock <= 0) {
            dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'No hay stock disponible' } })
        } else {
            dispatch({ type: 'ADD_QUANTY', value: { id, salesRoomStock } })
        }

    }

    const editQuanty = () => {
        if (rowData.quanty == 0) {
            dispatch({ type: 'REMOVE_FROM_CART', value: { id: rowData.id, salesRoomStock: rowData.salesRoomStock } })
            setOpenEditQuantyDialog(false)
        } else {
            if (rowData.stockControl === true) {
                if (stockControl == true && rowData.quanty > rowData.salesRoomStock) {
                    dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'No hay stock suficiente' } })
                } else {
                    dispatch({ type: 'EDIT_QUANTY', value: { id: rowData.id, quanty: rowData.quanty } })
                    setOpenEditQuantyDialog(false)
                }
            } else {
                dispatch({ type: 'EDIT_QUANTY', value: { id: rowData.id, quanty: rowData.quanty } })
                setOpenEditQuantyDialog(false)
            }

        }
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
                        removeProduct(params.row.id, params.row.salesRoomStock)
                    }}
                />,
                <GridActionsCellItem
                    sx={{ paddingLeft: 0, paddingRight: 0 }}
                    label='substract'
                    icon={<RemoveCircleIcon />}
                    onClick={() => {
                        substractProduct(params.row.id, params.row.salesRoomStock)
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
                            salesRoomStock: params.row.salesRoomStock,
                            name: params.row.name,
                            stockControl: params.row.stockControl

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


    return (
        <>
            <Paper elevation={0} variant="outlined" sx={{ height: '100%' }}>
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
            <PayDialog open={openPayDialog} setOpen={setOpenPayDialog} total={total} stockControl={stockControl} />
            {/* <Dialog open={openPayDialog} maxWidth={'xs'} fullWidth>
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
                            <InputAmount
                                label="Paga con:"
                                value={utils.renderMoneystr(payAmount)}
                                onChange={(e) => { e.target.value === '$ ' || e.target.value === '$' || e.target.value === '0' || e.target.value === '' ? setPayAmount(0) : setPayAmount(utils.moneyToInt(e.target.value)) }}
                                variant="outlined"
                                size={'small'}
                                fullWidth
                                ref={inputPayAmountRef}
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
            </Dialog> */}

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
                                    inputProps={{ step: "0.01", min: 0 }}
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
                <IconButton onClick={() => { clearCart() }}><RemoveShoppingCartIcon /></IconButton>
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


