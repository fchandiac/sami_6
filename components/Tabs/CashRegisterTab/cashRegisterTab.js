import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Movements from '../../Movements';
import CashRegister from '../../CashRegister'
import { useAppContext } from '../../../AppProvider'

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
  const { ordersMode } = useAppContext()

  const handleChange = (event, newValue) => {
    setValue(newValue);
  }




  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label={ordersMode ? 'Gestión de pedidos' : 'Caja Registradora'} {...a11yProps(0)} />
          {ordersMode ? null : <Tab label="Movimientos" {...a11yProps(1)} />}
          {ordersMode ? <Tab label="Pedidos" {...a11yProps(1)} /> : <Tab label="Pedidos" {...a11yProps(2)} />}
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <CashRegister></CashRegister>
      </TabPanel>
      <TabPanel value={value} index={ordersMode ? null : 1}>
        <Movements></Movements>
      </TabPanel>
      <TabPanel value={value} index={ordersMode ? 1 : 2}>
        Pedidos
      </TabPanel>
    </Box>
  )
}
