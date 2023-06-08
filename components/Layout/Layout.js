import {
  AppBar, Container, Grid, IconButton, Typography, Box, Divider, Drawer, List,
  ListItem, ListItemButton, ListItemText, Chip, Badge, Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Popper
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import AccountCircle from '@mui/icons-material/AccountCircle'
import ChevronLeft from '@mui/icons-material/ChevronLeft'
import NotificationsIcon from '@mui/icons-material/Notifications'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import React, { useState, useEffect, useRef } from 'react'
import { useAppContext } from '../../AppProvider'
import { useRouter } from 'next/router'
import { useTheme } from '@mui/material/styles'
import electron from 'electron'
const ipcRenderer = electron.ipcRenderer || false

import styles from './Layout.module.css'
import AppSnack from '../AppSnack/AppSnack'
import { DataGrid } from '@mui/x-data-grid'

const health = require('../../promises/health')
const stocks = require('../../promises/stocks')
const lioren = require('../../promises/lioren')

export default function Layout(props) {
  const { children } = props
  const { dispatch, pageTitle, stockAlertList, lock, ordersMode, user } = useAppContext()
  const theme = useTheme()
  const [drawerState, setDrawerState] = useState(false)
  const router = useRouter()
  const [openStockAlertDialog, setOpenStockAlertDialog] = useState(false)
  const [openAuthDialog, setOpenAuthDialog] = useState(false)
  const [adminPass, setAdminPass] = useState('')
  const [checkPass, setCheckPass] = useState('')
  const [cashRegisterUI, setCashRegisterUI] = useState({})
  const [popperAnchorEl, setpopperAnchorEl] = useState(null)


  useEffect(() => {
    let movements = ipcRenderer.sendSync('get-movements', 'sync')
    dispatch({ type: 'SET_MOVEMENTS', value: movements })
    let cashRegisterUI = ipcRenderer.sendSync('get-cash-register-UI', 'sync')
    setCashRegisterUI(cashRegisterUI)

    stocks.findAllStockAlert()
      .then(res => { dispatch({ type: 'SET_STOCK_ALERT_LIST', value: res }) })
      .catch(err => { console.log(err) })
  }, [router.pathname])

  useEffect(() => {
    health.test()
      .then(() => { console.log('conectado') })
      .catch(() => {
        dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'No se pudo conectar con el servidor' } })
      })
  }, [router.pathname])

  useEffect(() => {
    ipcRenderer.invoke('connection')
      .then(conn => {
        console.log('connection', conn)
        dispatch({ type: 'SET_WEB_CONNECTION', value: conn })
      })
  }, [router.pathname])

  useEffect(() => {
    let adminPass = ipcRenderer.sendSync('get-admin-pass', 'sync')
    let cashRegisterUI = ipcRenderer.sendSync('get-cash-register-UI', 'sync')
    setAdminPass(adminPass)
    dispatch({ type: 'SET_ORDERS_MODE', value: cashRegisterUI.orders_mode })
    dispatch({ type: 'SET_ORDERS', value: cashRegisterUI.orders })
  }, [])

  // useEffect(() => {
  //   lioren.miEmpresa()
  //     .then(res => { console.log(res) })

  // }, [])

  const updateLock = () => {
    if (lock === false) {

      dispatch({ type: 'LOCK' })
      console.log('Open')
    } else {
      if (checkPass == adminPass) {
        dispatch({ type: 'UNLOCK' })
        setCheckPass('')
        setOpenAuthDialog(false)
      } else {
        dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'Contraseña incorrecta' } })
        setCheckPass('')
      }
    }

  }

  const profileHandleClick = (e) => {
    setpopperAnchorEl(popperAnchorEl ? null : e.currentTarget)

  }
  const open = Boolean(popperAnchorEl);
  const id = open ? 'simple-popper' : undefined;

  return (
    <>
      <AppBar sx={{ display: router.pathname == '/' ? 'none' : 'block' }}>
        <Container sx={{ display: 'flex', alignItems: 'center', paddingTop: '0.3rem', paddingBottom: '0.3rem' }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={() => { setDrawerState(true) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {pageTitle}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h8" component="div" sx={{ flexGrow: 1, marginRight: '1rem' }}>
              {user.name}
            </Typography>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 1 }}
              onClick={profileHandleClick}
              aria-describedby={id}
            >
              <AccountCircle />
            </IconButton>
            <Popper
              open={open}
              id={id}
              anchorEl={popperAnchorEl}
            // placement="bottom-start"
            >
              <Box sx={{ pt: 2, width: 180 }}>
                <Box sx={{ background: '#E9F7EF', border: '1px solid #B3B6B7', borderRadius: '4px', p: 1 }}>
                  <Grid container spacing={1} direction={'column'}>
                    <Grid item>
                      <Typography fontSize={12} color={'#909497'}>Funcionario</Typography>
                      <Typography fontSize={14} sx={{ pl: 2 }}>{user.name}</Typography>
                    </Grid>
                    <Grid item>
                      <Typography fontSize={12} color={'#909497'}>Usuario</Typography>
                      <Typography fontSize={14} sx={{ pl: 2 }}>{user.user}</Typography>
                    </Grid>
                    <Grid item>
                      <Typography fontSize={12} color={'#909497'}>Pérfil</Typography>
                      <Typography fontSize={14} sx={{ pl: 2 }}>{user.profile}</Typography>
                    </Grid>
                    <Grid item textAlign={'right'}>
                      <Button 
                      size={'small'} 
                      onClick={() => { 
                        profileHandleClick() 
                        dispatch({ type: 'SET_PAGE_TITLE', value: 'Mi cuenta' })
                        router.push('/myAccount') 
                      }}
                      >Mi cuenta</Button>
                    </Grid>
                    <Grid item textAlign={'right'}>
                      <Button size={'small'} onClick={() => { profileHandleClick(); router.push('/') }}>Cerrar sesión</Button>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Popper>
            <IconButton onClick={() => { lock ? setOpenAuthDialog(true) : updateLock() }} color={'inherit'} size="large" sx={{ mr: 1 }}>
              <LockOpenIcon sx={{ display: lock ? 'none' : 'block' }} />
              <LockIcon sx={{ display: lock ? 'block' : 'none' }} />
            </IconButton>
            <Badge badgeContent={stockAlertList.length} color='secondary'>
              <Chip
                label="Alertas de stock"
                onClick={() => { setOpenStockAlertDialog(true) }}
                icon={<NotificationsIcon />}
                variant='outlined'
                color='info'
              />
            </Badge>

          </Box>
        </Container>
      </AppBar>
      <Drawer
        anchor='left'
        open={drawerState}
      >
        <Box sx={{ justifyContent: 'flex-end', display: 'flex', padding: '0.3rem' }}>
          <IconButton onClick={() => setDrawerState(false)} >
            <ChevronLeft />
          </IconButton>
        </Box>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemText primary={ordersMode ? 'Pedidos' : 'Caja'}
                onClick={() => {
                  router.push({
                    pathname: '/cashRegister',
                  })
                  dispatch({ type: 'SET_PAGE_TITLE', value: ordersMode ? 'Pedidos' : 'Caja' })
                  setDrawerState(false)
                  // dispatch({ type: 'CLEAR_CART' })
                }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemText primary='Productos'
                onClick={() => {
                  router.push({
                    pathname: '/products',
                  })
                  dispatch({ type: 'SET_PAGE_TITLE', value: 'Productos' })
                  setDrawerState(false)
                  // dispatch({ type: 'CLEAR_CART' })
                }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemText primary='Contabilidad'
                onClick={() => {
                  router.push({
                    pathname: '/accounting',
                  })
                  dispatch({ type: 'SET_PAGE_TITLE', value: 'Contabilidad' })
                  setDrawerState(false)
                  // dispatch({ type: 'CLEAR_CART' })
                }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemText primary='Clientes'
                onClick={() => {
                  router.push({
                    pathname: '/customers',
                  })
                  dispatch({ type: 'SET_PAGE_TITLE', value: 'Clientes' })
                  setDrawerState(false)
                  // dispatch({ type: 'CLEAR_CART' })
                }}
              />
            </ListItemButton>
          </ListItem>
          {/* <ListItem disablePadding>
            <ListItemButton>
              <ListItemText primary='Cuentas de usuario'
                onClick={() => {
                  router.push({
                    pathname: '/users',
                  })
                  dispatch({ type: 'SET_PAGE_TITLE', value: 'Cuentas de usuario' })
                  setDrawerState(false)
                  dispatch({ type: 'CLEAR_CART' })
                }}
              />
            </ListItemButton>
          </ListItem> */}
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemText primary='Configuración'
                onClick={() => {
                  router.push({
                    pathname: '/config',
                  })
                  dispatch({ type: 'SET_PAGE_TITLE', value: 'Configuración' })
                  setDrawerState(false)
                  // dispatch({ type: 'CLEAR_CART' })
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
      <Box>
        {children}
      </Box>
      <AppSnack />
      <Dialog open={openStockAlertDialog} fullWidth maxWidth={'md'}>
        <DialogTitle sx={{ p: 2 }}>Productos con alerta de stock</DialogTitle>
        <DialogContent sx={{ p: 2 }}>

          <DataGrid
            rows={
              stockAlertList.map(item => ({
                id: item.id,
                productName: item.Product.name,
                code: item.Product.code,
                storageName: item.Storage.name,
                stock: item.stock,
                critical_stock: item.critical_stock

              }))
            }
            columns={[
              { field: 'id', headerName: 'ID', flex: 1, hide: true },
              { field: 'productName', headerName: 'Nombre', flex: 2 },
              { field: 'code', headerName: 'Código', flex: 1 },
              { field: 'storageName', headerName: 'Almacén', flex: 1 },
              { field: 'stock', headerName: 'Stock', flex: 1 },
              { field: 'critical_stock', headerName: 'Stock critico', flex: 1 }
            ]}
            pageSize={100}
            localeText={esESGrid}
            rowsPerPageOptions={[100]}
            disableSelectionOnClick
            autoHeight
          />

        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant={'outlined'} onClick={() => { setOpenStockAlertDialog(false) }}>Cerrar</Button>
        </DialogActions>
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
                  autoFocus
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
