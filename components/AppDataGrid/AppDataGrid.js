import {
    DataGrid,
    esES,
    GridToolbarQuickFilter,
    useGridApiContext,
    useGridSelector,
    gridPageSelector,
    gridPageCountSelector,
} from '@mui/x-data-grid'


import { React, useEffect } from 'react'
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { createTheme, ThemeProvider } from '@mui/material/styles'
import TablePagination from '@mui/material/TablePagination'
import Pagination from '@mui/material/Pagination'
import { Button, Stack, Typography, Box, IconButton, Grid } from '@mui/material'
import { saveAs } from 'file-saver'
const ExcelJS = require('exceljs')
import moment from 'moment';

const theme = createTheme(
    esES,
);

function CustomToolbar(props) {
    const { gridHeader } = props

    return (
        <Box sx={{ p: 2 , m:1}}>
            <Stack
                direction="row-reverse"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
            >
                <GridToolbarQuickFilter inputProps={{autoFocus: true}}/>
                <Typography variant="h5" gutterBottom component="div">{gridHeader}</Typography>
            </Stack>
        </Box>
    )
}



function CustomFooter(props) {
    const { excelFileName, setGridApiRef } = props
    const apiRef = useGridApiContext()
    const page = useGridSelector(apiRef, gridPageSelector)
    const pageCount = useGridSelector(apiRef, gridPageCountSelector)


    useEffect(() => {
        setGridApiRef(apiRef)
    }, [])

    const exportExcel = () => {

        console.log(pageCount)
        const workbook = new ExcelJS.Workbook()
        var sheet = workbook.addWorksheet('sheet')

        var columns = apiRef.current.getAllColumns().map(column => ({
            header: column.headerName,
            key: column.field,
            width: convertFlexGridToExcel(column.flex)
        }))

        sheet.columns = columns

        var rows = Array.from(apiRef.current.getVisibleRowModels())
        rows.map(row => {
            // console.log(row[1])
            sheet.addRow(row[1])
        })
        var fileName = excelFileName + '_' + moment(Date.now()).format('DD-MM-YYYY') + '.xlsx'

        workbook.xlsx.writeBuffer().then(function (buffer) {
            //console.log(buffer);
            const blob = new Blob([buffer], { type: "applicationi/xlsx" })
            saveAs(blob, fileName)
        })
    }

    return (
        <Box sx={{ p: 1 }}>
            <Stack
                direction="row-reverse"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
            >
                <Button onClick={exportExcel}><FileDownloadIcon /> excel</Button>
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

    

    const exportExcel = () => {

        console.log(pageCount)
        const workbook = new ExcelJS.Workbook()
        var sheet = workbook.addWorksheet('sheet')

        var columns = apiRef.current.getAllColumns().map(column => ({
            header: column.headerName,
            key: column.field,
            width: convertFlexGridToExcel(column.flex)
        }))

        sheet.columns = columns

        var rows = Array.from(apiRef.current.getVisibleRowModels())
        rows.map(row => {
            // console.log(row[1])
            sheet.addRow(row[1])
        })
        var fileName = excelFileName + '_' + moment(Date.now()).format('DD-MM-YYYY') + '.xlsx'

        workbook.xlsx.writeBuffer().then(function (buffer) {
            //console.log(buffer);
            const blob = new Blob([buffer], { type: "applicationi/xlsx" })
            saveAs(blob, fileName)
        })
    }

    return (
        <Box sx={{ p: 1 }}>
            <Stack
                direction="row-reverse"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
            >
                <Button onClick={exportExcel}><FileDownloadIcon /> excel</Button>
                <Pagination
                    color="primary"
                    count={pageCount}
                    page={page + 1}
                    
                    onChange={(event, value) => apiRef.current.setPage(value - 1)}
                />
                {/* <Typography>{'khgkjg'}</Typography> */}
            </Stack>
        </Box>

    )
}

export default function AppDataGrid(props) {
    const { rows, columns, title, height, setGridApiRef } = props
    return (
        <Box sx={{ width: '100%', height: height }}>
                <DataGrid
                    localeText={esESGrid}
                    rows={rows}
                    columns={columns}
                    pagination
                    components={{ Toolbar: CustomToolbar, Pagination: CustomPagination }}
                    getRowHeight={() => 'auto'}
                    componentsProps={{
                        toolbar: {
                            showQuickFilter: true,
                            gridHeader: title,
                        },
                        pagination: {
                            excelFileName: title,
                            setGridApiRef: setGridApiRef
                        }

                    }}
                />
        </Box>
    )
}


function convertFlexGridToExcel(flex) {
    var excelWidth = flex * 20
    return excelWidth
}


const esESGrid = {
    // Root
    noRowsLabel: 'Sin filas',
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
    footerRowSelected: count => count > 1 ? '': '',
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

