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

export default function Layout(props) {
  const { children } = props
  const { dispatch, pageTitle, stockAlertList, lock, ordersMode } = useAppContext()
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
    let adminPass = ipcRenderer.sendSync('get-admin-pass', 'sync')
    let cashRegisterUI = ipcRenderer.sendSync('get-cash-register-UI', 'sync')
    setAdminPass(adminPass)
    dispatch({ type: 'SET_ORDERS_MODE', value: cashRegisterUI.orders_mode })
  }, [])

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
      <AppBar sx={{display: router.pathname == '/'? 'none': 'block'}}>
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
              {''}
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
              placement="bottom-start"
            >
              <Button onClick= {() => router.push('/')}>logOut</Button>
            </Popper>
            <IconButton onClick={() => { lock ? setOpenAuthDialog(true) : updateLock()  }} color={'inherit'} size="large" sx={{ mr: 1 }}>
              <LockOpenIcon sx={{ display: lock ? 'none' : 'block' }} />
              <LockIcon sx={{ display: lock ? 'block' : 'none' }} />
            </IconButton>
            <Badge badgeContent={stockAlertList.length} color='secondary'>
              <Chip
                label="Alertas de stock"
                onClick={() => { setOpenStockAlertDialog(true); console.log(stockAlertList) }}
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
                  dispatch({ type: 'CLEAR_CART' })
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
                  dispatch({ type: 'CLEAR_CART' })
                }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemText primary='Usuarios'
                onClick={() => {
                  router.push({
                    pathname: '/users',
                  })
                  dispatch({ type: 'SET_PAGE_TITLE', value: 'Usuarios' })
                  setDrawerState(false)
                  dispatch({ type: 'CLEAR_CART' })
                }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemText primary='Configuración'
                onClick={() => {
                  router.push({
                    pathname: '/config',
                  })
                  dispatch({ type: 'SET_PAGE_TITLE', value: 'Configuración' })
                  setDrawerState(false)
                  dispatch({ type: 'CLEAR_CART' })
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
            pagination={false}
            pageSize={100}
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



