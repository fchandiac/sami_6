import React, { useReducer } from 'react'
import '../styles/global.css'

import { createTheme, ThemeProvider } from '@mui/material/styles'
import { esES } from '@mui/material/locale'
import { AppProvider } from '../AppProvider'
const theme = createTheme(
  {
    palette: {
      primary: { main: '#1976d2' }
    },
  }, esES)

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

