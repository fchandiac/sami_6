import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Products from '../../Products';
import Categories from '../../Categories';
import Stocks from '../../Stocks/Stocks';



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
        <Box sx={{ paddingTop: 1 }}>
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
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange}>
          <Tab label="Productos" {...a11yProps(0)} />
          <Tab label="Stocks" {...a11yProps(1)} />
          <Tab label="Categorías" {...a11yProps(2)} />
          <Tab label="Impuestos" {...a11yProps(3)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <Products />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Stocks />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Categories />
      </TabPanel>
      <TabPanel value={value} index={3}>
        Impuestos
      </TabPanel>
    </Box>
  )
}
