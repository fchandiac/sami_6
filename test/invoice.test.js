import React, {useState} from 'react';
import { render, screen } from '@testing-library/react';
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
}));

const renderWithAppContext = (component) => {
  return render(
    <AppProvider>
      {component}
    </AppProvider>

  );
};



describe('Component', () => {
  const [open, setOpen] = useState(true);
  let customerForInvoice = { id: 0 }

  it('renders component correctly', () => {
    renderWithAppContext(
      <Invoice
        open={open}
        setOpen={setOpen}
        customerForInvoice={customerForInvoice}
      />);;

    // expect(screen.getByText('Hello, World!')).toBeInTheDocument();
  });
});