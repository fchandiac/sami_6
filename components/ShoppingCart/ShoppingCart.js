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
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'
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




export default function ShoppingCart(props) {
    const { stockControl, quote } = props
    const { cart, total, lock, dispatch, ordersMode } = useAppContext()
    const [rowData, setRowData] = useState([])
    const [openPayDialog, setOpenPayDialog] = useState(false)
    const [openNewCustomerDialog, setOpenNewCustomerDialog] = useState(false)
    const [openEditQuantyDialog, setOpenEditQuantyDialog] = useState(false)
    const [openDiscountDialog, setOpenDiscountDialog] = useState(false)
    const [discount, setDiscount] = useState(0)
    const [printerInfo, setPrinterInfo] = useState({ idProduct: 0, idVendor: 0 })
    const [ticketInfo, setTicketInfo] = useState({ name: '', address: '', phone: '', rut: '' })
    const [openSpecialProductDialog, setOpenSpecialProductDialog] = useState(false)
    const [specialProduct, setSpecialProduct] = useState(specialProductDefault())



    useEffect(() => {
        let print_info = ipcRenderer.sendSync('get-printer', 'sync')
        let ticket_info = ipcRenderer.sendSync('get-ticket-info', 'sync')
        setPrinterInfo(print_info)
        setTicketInfo(ticket_info)
    }, [])

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "ç") {
                if (ordersMode === true) {
                    alert('Nuevo pedido')
                } else {
                    if (cart.length === 0) {
                        dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'No hay productos en el carrito' } })
                    } else {
                        setOpenPayDialog(true)
                    }
                }
            }
        }
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        }
    }, [cart])


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

    const openSpecialProductUI = () => {
        setOpenSpecialProductDialog(true)
    }

    const applyDiscount = (discount) => {
        dispatch({ type: 'GLOBAL_DISCOUNT', value: discount })
        setOpenDiscountDialog(false)
    }


    const printQuote = () => {
        if (cart.length === 0) {
            dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'No hay productos en el carrito' } })
        } else {
            print.quote(total, cart, ticketInfo, printerInfo)
                .then(() => {
                    dispatch({ type: 'CLEAR_CART' })
                })
                .catch((err) => {
                    console.log('imprimiendo', printerInfo)
                    console.log(err)
                    dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'Error de conexión con la impresora' } })
                })


        }

    }

    const addSpecialProduct = () => {
        console.log(specialProduct.quanty * specialProduct.sale)
        let id =  Math.floor(Math.random() * (99999 - 20000 + 1)) + 20000
        let quanty = parseFloat(specialProduct.quanty)
        let subTotal = quanty * specialProduct.sale
        let specialPro = {
            id: id,
            name: specialProduct.name,
            quanty: quanty,
            sale: specialProduct.sale,
            subTotal: subTotal,
            salesRoomStock: 1,
            virtualStock: 1,
            discount: 0,
            controlStock: false,
            code: '0001' + Math.floor(Math.random() * 1000).toString(),
            specialProduct: true
        }
        dispatch({ type: 'ADD_SPECIAL_TO_CART', value:  specialPro })
        setOpenSpecialProductDialog(false)
        setSpecialProduct(specialProductDefault())

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
                            quote: quote,
                            printQuote: printQuote,
                            proccessPayment: proccessPayment,
                            openDiscountUI: openDiscountUI,
                            clearCart: clearCart,
                            ordersMode: ordersMode,
                            openSpecialProductUI: openSpecialProductUI


                        }

                    }}

                />

            </Paper>
            <PayDialog open={openPayDialog} setOpen={setOpenPayDialog} total={total} stockControl={stockControl} />

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

            <Dialog open={openSpecialProductDialog} maxWidth={'xs'} fullWidth>
                <DialogTitle sx={{ p: 2 }}>
                    Producto Especial
                </DialogTitle>
                <form onSubmit={(e) => { e.preventDefault(); addSpecialProduct() }}>
                    <DialogContent sx={{ p: 2 }}>
                        <Grid container spacing={1} direction={'column'}>

                            <Grid item>
                                <TextField
                                    label="Nombre"
                                    value={specialProduct.name}
                                    onChange={(e) => { setSpecialProduct({ ...specialProduct, name: e.target.value }) }}
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                    autoFocus
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    label="Cantidad"
                                    value={specialProduct.quanty}
                                    onChange={(e) => { setSpecialProduct({ ...specialProduct, quanty: e.target.value }) }}
                                    type="number"
                                    inputProps={{ step: "0.01", min: 1 }}
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    label="Precio"
                                    value={utils.renderMoneystr(specialProduct.sale)}
                                    onChange={(e) => { e.target.value === '$ ' || e.target.value === '$' || e.target.value === '0' || e.target.value === '' ? setSpecialProduct({ ...specialProduct, sale: 0 }) : setSpecialProduct({ ...specialProduct, sale: utils.moneyToInt(e.target.value) }) }}
                                    variant="outlined"
                                    size={'small'}
                                    fullWidth
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button variant={'contained'} type={'submit'}>Agregar</Button>
                        <Button variant={'outlined'} onClick={() => setOpenSpecialProductDialog(false)}>Cerrar</Button>
                    </DialogActions>
                </form>
            </Dialog>


        </>
    )
}

function specialProductDefault() {
    return ({
        id: 0,
        name: '',
        quanty: 1,
        sale: 0,
        subTotal: 0,
        salesRoomStock: 0,
        virtualStock: 0,
        discount: 0,
        controlStock: false,
        code: '0001' + Math.floor(Math.random() * 1000).toString()
    })
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
    const { lock, proccessPayment, openDiscountUI, clearCart, quote, printQuote, ordersMode, openSpecialProductUI } = props




    return (
        <>
            <Grid container spacing={1} direction={'row'} justifyContent={'flex-end'} alignItems={'center'} paddingRight={1}>
                <Grid item>
                    <IconButton onClick={() => { openSpecialProductUI() }}>
                        <LibraryAddIcon />
                    </IconButton>
                </Grid>
                <Grid item>
                    <Button
                        sx={{ display: ordersMode ? 'none' : 'block' }}
                        variant="contained"
                        onClick={() => { proccessPayment() }}>
                        Procesar Pago
                    </Button>
                </Grid>
                <Grid item>
                    <Button
                        sx={{ display: ordersMode ? 'block' : 'none' }}
                        variant="contained"
                        onClick={() => { console.log('New order') }}>
                        Nuevo Pedido
                    </Button>
                </Grid>
                <Grid item>
                    <Button variant={'outlined'} sx={{ display: quote ? 'block' : 'none' }} onClick={() => { printQuote() }}>Cotización</Button>
                </Grid>
                <Grid item>
                    <Button variant={'outlined'} sx={{ display: lock ? 'none' : 'block' }} onClick={() => { openDiscountUI() }}>Descuento</Button>
                </Grid>
                <Grid item>
                    <IconButton onClick={() => { clearCart() }}><RemoveShoppingCartIcon /></IconButton>
                </Grid>
            </Grid>

        </>
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


