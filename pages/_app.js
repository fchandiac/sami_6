import React, { } from 'react'
import '../styles/global.css'

import { createTheme, ThemeProvider } from '@mui/material/styles'
import { esES } from '@mui/material/locale'
import { AppProvider, useAppContext } from '../AppProvider'
import Layout from '../components/Layout/Layout'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { LocalizationProvider, esES as esESPick } from '@mui/x-date-pickers'
import moment from 'moment'



const theme = createTheme(
  {
    palette: {
      primary: {
        main: '#1a9358',
      },
      secondary: {
        main: '#e32b65',
      },
      info: {
        main: '#fff',
      },
      error: {
        main: '#f44336',
      }

    },
  }, esES)
//#f44336
//#ff5722

// { palette: { primary: { main: '#1976d2' }, }, }

// { palette: { 
//   primary: { main: '#ef5350' },
//   secondary: {main: '#616161'}
// }


const loc = moment.locale('en',
  {
    months: 'enero_febrero_marzo_abril_mayo_junio_julio_agosto_septiembre_octubre_noviembre_diciembre'.split('_'),
    weekdays: 'domingo_lunes_martes_miércoles_jueves_viernes_sábado'.split('_'),
    weekdaysShort: 'dom._lun._mar._mie._jue._vie._sab.'.split('_')
  })


export default function App({ Component, pageProps }) {
  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <AppProvider>
        <ThemeProvider theme={theme}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ThemeProvider>
      </AppProvider>
    </LocalizationProvider>


  )
}

