import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Movements from '../../Movements';
import CashRegister from '../../CashRegister'
import { useAppContext } from '../../../AppProvider'

import electron from 'electron'
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
  const [value, setValue] = React.useState(0)
  const { ordersMode, movements, dispatch } = useAppContext()


 

  const handleChange = (event, newValue) => {
    setValue(newValue);
  }

  const renderCashRegister = () => {
    if (ordersMode == true && movements.state == true){
      return (<Tab label={'Gestión de pedidos'} {...a11yProps(0)} />)
    } else if (ordersMode == false && movements.state == true){
      return (<Tab label={'Caja registradora'} {...a11yProps(0)} />)
    } else if (ordersMode == false && movements.state == false){
      return null
    } else if (ordersMode == true && movements.state == false){
      return (<Tab label={'Gestión de pedidos'} {...a11yProps(0)} />)
    }

  }

  const cashRegisterindex = () => {
    if (ordersMode == true && movements.state == true){
      return 0
    } else if (ordersMode == false && movements.state == true){
      return 0
    } else if (ordersMode == false && movements.state == false){
      return null
    } else if (ordersMode == true && movements.state == false){
      return 0
    }
  }

  const renderMovenments = () => {
    if (ordersMode == true && movements.state == true){
       return null
    } else if (ordersMode == false && movements.state == true){
      return (<Tab label={'Movimientos'} {...a11yProps(1)} />)
    } else if (ordersMode == false && movements.state == false){
      return (<Tab label={'Movimientos'} {...a11yProps(0)} />)
    } else if (ordersMode == true && movements.state == false){
      return null
    }
  }

  const movenmentsindex = () => {
    if (ordersMode == true && movements.state == true){
      return null
    } else if (ordersMode == false && movements.state == true){
      return 1
    } else if (ordersMode == false && movements.state == false){
      return 0
    } else if (ordersMode == true && movements.state == false){
      return null
    }
  }

  const ordersIndex = () => {
    if (ordersMode == true && movements.state == true){
      return 1
    } else if (ordersMode == false && movements.state == true){
      return 2
    } else if (ordersMode == false && movements.state == false){
      return 1
    } else if (ordersMode == true && movements.state == false){
      return 1
    }
  }




  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          {renderCashRegister()}
          {renderMovenments()}
          {ordersMode ? <Tab label="Pedidos" {...a11yProps(1)} /> : <Tab label="Pedidos" {...a11yProps(2)} />}
        </Tabs>
      </Box>
      <TabPanel value={value} index={cashRegisterindex()}>
        <CashRegister></CashRegister>
      </TabPanel>
      <TabPanel value={value} index={movenmentsindex()}>
        <Movements></Movements>
      </TabPanel>
      <TabPanel value={value} index={ordersIndex()}>
        Pedidos
      </TabPanel>
    </Box>
  )
}
