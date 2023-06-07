import React, { useState, useEffect, useRef } from 'react'
import {
    DataGrid,
    esES,
    GridToolbarQuickFilter,
    useGridApiContext,
    useGridApiRef,
    useGridSelector,
    gridPageSelector,
    gridPageCountSelector,
} from '@mui/x-data-grid'
import Pagination from '@mui/material/Pagination'
import { GridActionsCellItem } from '@mui/x-data-grid'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import { useAppContext } from '../../AppProvider'
import { ThemeProvider } from '@mui/material/styles'
import { Box, Paper, Stack, Typography } from '@mui/material'

const products = require('../../promises/products')
const utils = require('../../utils')

export default function ProductFinder(props) {
    const { stockControl } = props
    const { cart, dispatch, cartChanged, product, actionType } = useAppContext()
    const [gridApiRef, setGridApiRef] = useState(null)
    const [rowData, setRowData] = useState({})
    const [productsList, setProductsList] = useState([])

    useEffect(() => {
        console.log('ProductFinder')
        products.findAll()
            .then(res => {
                let data = res.map((item) => ({
                    id: item.id,
                    name: item.name,
                    code: item.code,
                    sale: item.sale == undefined ? 0 : item.sale,
                    salesRoomStock: item.Stocks.find(item => (item.storage_id == 1001)) == undefined ? 0 : item.Stocks.find(item => (item.storage_id == 1001)).stock,
                    stockControl: item.stock_control
                }))
                setProductsList(data)
            })
            .catch(err => { console.log(err) })
    }, [])



    useEffect(() => {
        switch (actionType) {
            case 'NONE_TYPE':
                console.log('NONE_TYPE')
                break
            case 'NEW_ADD_TO_CART':
                console.log('NEW_ADD_TO_CART', product)
                 gridApiRef != undefined && gridApiRef.current.updateRows([{ id: product.id, salesRoomStock: stockControl ? product.virtualStock : product.salesRoomStock }])
                //gridApiRef != undefined && gridApiRef.current.updateRows([{ id: product.id, salesRoomStock: 2}])
                break
            case 'ADD_TO_CART':
                console.log('ADD_TO_CART', product)
                 gridApiRef != undefined && gridApiRef.current.updateRows([{ id: product.id, salesRoomStock: stockControl ? product.virtualStock : product.salesRoomStock }])
                //gridApiRef != undefined && gridApiRef.current.updateRows([{ id: product.id, salesRoomStock: 2}])
                break
            case 'REMOVE_FROM_CART':
                gridApiRef != undefined && gridApiRef.current.updateRows([{ id: product.id, salesRoomStock: product.salesRoomStock }])
                break
            case 'SUBSTRACT_QUANTY':
                console.log('SUBSTRACT_QUANTY', product)
                if (product.specialProduct == false) {
                    gridApiRef != undefined && gridApiRef.current.updateRows([{ id: product.id, salesRoomStock: stockControl ? product.virtualStock : product.salesRoomStock }])
                }
                break
            case 'ADD_QUANTY':
                console.log('ADD_QUANTY', product)
                if (product.specialProduct == false) {
                gridApiRef != undefined && gridApiRef.current.updateRows([{ id: product.id, salesRoomStock: stockControl ? product.virtualStock : product.salesRoomStock }])
                }
                break
            case 'EDIT_QUANTY':
                console.log('EDIT_QUANTY', product)
                if (product.specialProduct == false) {
                gridApiRef != undefined && gridApiRef.current.updateRows([{ id: product.id, salesRoomStock: stockControl ? product.virtualStock : product.salesRoomStock }])
                }
                break
            case 'CLEAR_CART':
                products.findAll()
                    .then(res => {
                        let data = res.map((item) => ({
                            id: item.id,
                            name: item.name,
                            code: item.code,
                            sale: item.sale,
                            salesRoomStock: item.Stocks.find(item => (item.storage_id == 1001)) == undefined ? 0 : item.Stocks.find(item => (item.storage_id == 1001)).stock,
                            stockControl: item.stock_control
                        }))
                        setProductsList(data)
                    })
                    .catch(err => { console.log(err) })
                break
            default:
                console.log('DEFAULT')
                break
        }
    }, [cartChanged])



    

    const addToCart = (product) => {
        if (product.stockControl == false) {
            dispatch({ type: 'ADD_TO_CART', value: product })
        } else if (stockControl == true && product.salesRoomStock <= 0) {
            dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'No hay stock disponible' } })
        } else {
            console.log('addToCart', product)
            dispatch({ type: 'ADD_TO_CART', value: product })

        }
    }


    const columns = [
        { field: 'id', headerName: 'Id', flex: .3, type: 'number', hide: true },
        { field: 'code', headerName: 'Código', flex: .6 },
        { field: 'name', headerName: 'Nombre', flex: 1 },
        {
            field: 'salesRoomStock',
            headerName: 'Stock sala',
            flex: .7,
            hide: !stockControl,
            renderCell: (params) => (
                params.row.stockControl ? params.value : '-'
                //params.value
            )
        }, //valueFormatter: (params) => (utils.renderMoneystr(params.value))
        { field: 'sale', headerName: 'Precio Venta', flex: .7,  valueFormatter: (params) => (utils.renderMoneystr(params.value))},
        {
            field: 'actions',
            headerName: '',
            headerClassName: 'data-grid-last-column-header',
            type: 'actions', flex: .3, getActions: (params) => [
                <GridActionsCellItem
                    label='addToCart'
                    icon={<ShoppingCartIcon />}
                    onClick={() => {
                        addToCart({
                            id: params.row.id,
                            name: params.row.name,
                            quanty: 1,
                            sale: params.row.sale,
                            subTotal: params.row.sale,
                            discount: 0,
                            salesRoomStock: params.row.salesRoomStock,
                            virtualStock: params.row.salesRoomStock,
                            stockControl: params.row.stockControl,
                            code: params.row.code,
                            specialProduct: false
                        })
                    }}
                />
            ]
        }
    ]


    return (
        <>
            <Paper elevation={0} variant="outlined" sx={{ height: '60vh' }}>
                <DataGrid
                    sx={{ border: 'none' }}
                    localeText={esESGrid}
                    rows={productsList}
                    columns={columns}
                    pagination
                    components={{ Toolbar: CustomToolbar, Pagination: CustomPagination }}
                    getRowHeight={() => 'auto'}
                    componentsProps={{
                        toolbar: {
                            showQuickFilter: true,
                            gridHeader: 'Productos',
                        },
                        pagination: {
                            setGridApiRef: setGridApiRef,
                        }

                    }}
                />
            </Paper>
        </>
    )
}


function CustomToolbar(props) {
    const { gridHeader } = props

    return (
        <Box sx={{ p: 2, m: 1 }}>
            <Stack
                direction="row-reverse"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
            >
                <GridToolbarQuickFilter />
                <Typography variant="h5" gutterBottom component="div">{gridHeader}</Typography>
            </Stack>
        </Box>
    )
}

function CustomPagination(props) {
    const { excelFileName, setGridApiRef } = props
    const apiRef = useGridApiContext()
    const page = useGridSelector(apiRef, gridPageSelector)
    const pageCount = useGridSelector(apiRef, gridPageCountSelector)

    useEffect(() => {
        setGridApiRef(apiRef)
    }, [])



    return (
        <Box sx={{ p: 1 }}>
            <Stack
                direction="row-reverse"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
            >
                <Pagination
                    color="primary"
                    count={pageCount}
                    page={page + 1}

                    onChange={(event, value) => apiRef.current.setPage(value - 1)}
                />
            </Stack>
        </Box>

    )
}

const esESGrid = {
    // Root
    noRowsLabel: 'Sin pdoductos',
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
