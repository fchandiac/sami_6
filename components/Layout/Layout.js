import {
  AppBar, Container, Grid, IconButton, Typography, Box, Divider, Drawer, List,
  ListItem, ListItemButton, ListItemText, Chip, Badge
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import AccountCircle from '@mui/icons-material/AccountCircle'
import ChevronLeft from '@mui/icons-material/ChevronLeft'
import NotificationsIcon from '@mui/icons-material/Notifications'
import React, { useState, useEffect } from 'react'
import { useAppContext } from '../../AppProvider'
import { useRouter } from 'next/router'
import { useTheme } from '@mui/material/styles'


import styles from './Layout.module.css'
import AppSnack from '../AppSnack/AppSnack'


const health = require('../../promises/health')

export default function Layout(props) {
  const { children } = props
  const { dispatch, pageTitle, stockAlertList } = useAppContext()
  const theme = useTheme()
  const [drawerState, setDrawerState] = useState(false)
  const router = useRouter()

  useEffect(() => {
    health.test()
      .then(() => { console.log('conectado') })
      .catch(() => {
        dispatch({ type: 'OPEN_SNACK', value: { type: 'error', message: 'No se pudo conectar con el servidor' } })
      })
  }, [router.pathname])

  return (
    <>
      <AppBar >
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
              {stockAlertList.length > 0 ? `Alertas de stock: ${stockAlertList.length}` : ''}
            </Typography>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <AccountCircle />
            </IconButton>
            <Badge badgeContent={stockAlertList.length} color='secondary'>
              <Chip
                label="Alertas de stock"
                onClick={() => { console.log('click') }}
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
              <ListItemText primary='Caja'
                onClick={() => {
                  router.push({
                    pathname: '/cashRegister',
                  })
                  dispatch({ type: 'SET_PAGE_TITLE', value: 'Caja' })
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
    </>

  )
}



