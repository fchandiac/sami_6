import {
  AppBar, Container, Grid, IconButton, Typography, Box, Divider, Drawer, List,
  ListItem, ListItemButton, ListItemText
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import AccountCircle from '@mui/icons-material/AccountCircle'
import ChevronLeft from '@mui/icons-material/ChevronLeft'
import React, { useState, useEffect } from 'react'
import { useAppContext } from '../../AppProvider'
import { useRouter } from 'next/router'


// can use on component className={styles.exampleClass}
import styles from './Layout.module.css'
import AppSnack from '../AppSnack/AppSnack'


const health = require('../../promises/health')

export default function Layout(props) {
  const { children } = props
  const { dispatch, pageTitle } = useAppContext()
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
          {/* <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h8" component="div" sx={{ flexGrow: 1, marginRight: '1rem' }}>
              name profile
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
          </Box> */}
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
                    pathname: '/',
                  })
                  dispatch({ type: 'SET_PAGE_TITLE', value: 'Caja' })
                  setDrawerState(false)
                  dispatch({type: 'CLEAR_CART'})
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
                  dispatch({type: 'CLEAR_CART'})
                }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
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
                  dispatch({type: 'CLEAR_CART'})
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



