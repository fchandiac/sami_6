import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Movements from '../../Movements';
import CashRegister from '../../CashRegister'
import { useAppContext } from '../../../AppProvider'

import electron from 'electron'
import Orders from '../../Orders/Orders';
const ipcRenderer = electron.ipcRenderer || false

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 1 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs() {
  const { ordersMode, movements, dispatch, orders, cashRegisterTab } = useAppContext()
  const [hiddenOrders, setHiddenOrders] = useState(false)
  const [hiddenMovements, setHiddenMovements] = useState(false)

  useEffect(() => {
    let UI = ipcRenderer.sendSync('get-cash-register-UI', 'sync')
    setHiddenOrders(!UI.orders)
    setHiddenMovements(ordersMode)
  
  }, [])


  const handleChange = (event, newValue) => {
    dispatch({ type: 'SET_CASH_REGISTER_TAB', value: newValue })
  }

  const renderCashRegister = () => {
    if (ordersMode == true) {
      return true
    } else if (movements.state == false) {
      return false
    } else if (movements.state == true) {
      return true
    }
  }

  //sx={{display: hiddenOrders? 'none': 'inline-flex'}}

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={cashRegisterTab} onChange={handleChange} aria-label="basic tabs example">
          <Tab label={ordersMode? 'Gestión de pedidos': 'Caja registradora'} {...a11yProps(0)} sx={{display: renderCashRegister()? 'inline-flex': 'none'}}/>
          <Tab label="Movimientos" {...a11yProps(1)} sx={{display: hiddenMovements? 'none': 'inline-flex'}}/>
          <Tab label="Pedidos" {...a11yProps(2)}  sx={{display: hiddenOrders? 'none': 'inline-flex'}}/>
        </Tabs>
      </Box>
      <TabPanel value={cashRegisterTab} index={0}>
        <CashRegister></CashRegister>
      </TabPanel>
      <TabPanel value={cashRegisterTab} index={1}>
        <Movements></Movements>
      </TabPanel>
      <TabPanel value={cashRegisterTab} index={2}>
        <Orders />
      </TabPanel>
    </Box>
  )
}
