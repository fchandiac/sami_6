import React, { } from 'react'
import '../styles/global.css'

import { createTheme, ThemeProvider } from '@mui/material/styles'
import { esES } from '@mui/material/locale'
import { AppProvider, useAppContext  } from '../AppProvider'
import AppSnack from '../components/AppSnack/AppSnack'



const theme = createTheme(
  {
    palette: {
      primary: { main: '#1976d2' },
      error: { main: '#f44336' },
    },
  }, esES)
  //#f44336
  //#ff5722

// { palette: { primary: { main: '#1976d2' }, }, }

// { palette: { 
//   primary: { main: '#ef5350' },
//   secondary: {main: '#616161'}
// }



export default function App({ Component, pageProps }) {
  return (
    <AppProvider>
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </AppProvider>


  )
}

