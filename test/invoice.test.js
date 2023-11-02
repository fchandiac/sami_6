import React, { useState } from 'react';
import { render, screen,  act } from '@testing-library/react';
import Invoice from '../components/Invoice/Invoice';
import { AppProvider } from '../AppProvider';
import { ipcRenderer as mockIpcRenderer } from 'electron'





jest.mock('electron', () => ({
  ipcRenderer: {
    sendSync: jest.fn().mockImplementation((channel, arg) => {
      // Implementa aquí la lógica simulada para las llamadas a sendSync
      // y devuelve el resultado esperado para cada llamada
      if (channel === 'get-printer') {
        return 'printer-result';
      } else if (channel === 'get-ticket-info') {
        return 'ticket-info-result';
      } else if (channel === 'get-lioren') {
        return { token: 'lioren-token' };
      } else if (channel === 'get-api-url') {
        return 'http://localhost:3002/';
      }
      // Maneja otros canales según sea necesario
    }),
  },
}))

const customersPr = require('../promises/customers')


jest.mock('../promises/customers', () => {
  return {
    findAll: jest.fn().mockResolvedValue([{
      key: 2001,
      id: 2001,
      rut: '12345678-9',
      label: 'Test Customer',
      activity: 'Test Activity',
      district: 0,
      city: 0,
      address: 'Test Address',
    }]),
  };
})



// global.fetch = jest.fn().mockResolvedValue({
//   json: jest.fn().mockResolvedValue([]),
// });




const renderWithAppContext = (component) => {
  return render(
    <AppProvider>
      {component}
    </AppProvider>

  );
};



describe('Component', () => {
  const open = true
  const setOpen = (value) => {
    open = value
  }
  let customerForInvoice = { id: 0 }

  it('renders component correctly', async  () => {
    renderWithAppContext(
      <Invoice
        open={open}
        setOpen={setOpen}
        customerForInvoice={customerForInvoice}
      />)

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
        

      });
     

    // expect(screen.getByText('Hello, World!')).toBeInTheDocument();
  });
});