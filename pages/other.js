import React from 'react'
import Layout from '../components/Layout'
import { Autocomplete, Button, TextField } from '@mui/material'
import AppDataGrid from '../components/AppDataGrid/AppDataGrid'
import AnnouncementIcon from '@mui/icons-material/Announcement';
import { GridActionsCellItem } from '@mui/x-data-grid';


export default function other() {

  const alertId = React.useCallback(
    (id) => () => {
      alert(id)
    },
    [],
  );

  const columns = [
    { field: 'id', headerName: 'Id', flex: 1, type: 'number'},
    { field: 'firstName', headerName: 'First name', flex:2},
    { field: 'lastName', headerName: 'Last name', flex:2 },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions', width: 130, getActions: (params) => [
        <GridActionsCellItem
          icon={<AnnouncementIcon />}
          label='alert'
          onClick={alertId(params.id)}
        />]
    }

  ];



  const rows = [
    { id: 1, lastName: 'Snow', firstName: 'Jon' },
    { id: 2, lastName: 'Lannister', firstName: 'Cersei' },
    { id: 3, lastName: 'Lannister', firstName: 'Jaime' },
    { id: 4, lastName: 'Stark', firstName: 'Arya' },
    { id: 5, lastName: 'Targaryen', firstName: 'Daenerys' },
    { id: 6, lastName: 'Snow', firstName: 'Jon' },
    { id: 7, lastName: 'Lannister', firstName: 'Cersei' },
    { id: 9, lastName: 'Lannister', firstName: 'Jaime' },
    { id: 10, lastName: 'Stark', firstName: 'Arya' },
    { id: 11, lastName: 'Targaryen', firstName: 'Daenerys' },
    { id: 12, lastName: 'Snow', firstName: 'Jon' },
    { id: 13, lastName: 'Lannister', firstName: 'Jaime' },
    { id: 14, lastName: 'Stark', firstName: 'Arya' },
    { id: 15, lastName: 'Targaryen', firstName: 'Daenerys' },
    { id: 16, lastName: 'Snow', firstName: 'Jon' },
    { id: 17, lastName: 'Lannister', firstName: 'Cersei' },
    { id: 18, lastName: 'Lannister', firstName: 'Jaime' },
    { id: 19, lastName: 'Stark', firstName: 'Arya' },
    { id: 20, lastName: 'Targaryen', firstName: 'Daenerys' },
    { id: 21, lastName: 'Snow', firstName: 'Jon' },
    { id: 22, lastName: 'Lannister', firstName: 'Cersei' },
    { id: 23, lastName: 'Lannister', firstName: 'Jaime' },
    { id: 24, lastName: 'Stark', firstName: 'Arya' },
    { id: 25, lastName: 'Targaryen', firstName: 'Daenerys' },
    { id: 26, lastName: 'Snow', firstName: 'Jon' },
    { id: 27, lastName: 'Lannister', firstName: 'Cersei' },
    { id: 28, lastName: 'Lannister', firstName: 'Jaime' },
    { id: 29, lastName: 'Stark', firstName: 'Arya' },
    { id: 30, lastName: 'Targaryen', firstName: 'Daenerys' },
    { id: 31, lastName: 'Snow', firstName: 'Jon' },
    { id: 32, lastName: 'Lannister', firstName: 'Cersei' },
    { id: 33, lastName: 'Lannister', firstName: 'Jaime' },
    { id: 34, lastName: 'Stark', firstName: 'Arya' },
    { id: 35, lastName: 'Targaryen', firstName: 'Daenerys' },
    { id: 36, lastName: 'Snow', firstName: 'Jon' },
    { id: 37, lastName: 'Lannister', firstName: 'Cersei' },
    { id: 38, lastName: 'Lannister', firstName: 'Jaime' },
    { id: 39, lastName: 'Stark', firstName: 'Arya' },
    { id: 40, lastName: 'Targaryen', firstName: 'Daenerys' },
    { id: 41, lastName: 'Snow', firstName: 'Jon' },
    { id: 42, lastName: 'Lannister', firstName: 'Cersei' },
    { id: 43, lastName: 'Lannister', firstName: 'Jaime' },
    { id: 44, lastName: 'Stark', firstName: 'Arya' },
    { id: 45, lastName: 'Targaryen', firstName: 'Daenerys' },
    { id: 46, lastName: 'Snow', firstName: 'Jon' },
    { id: 47, lastName: 'Lannister', firstName: 'Cersei' },
    { id: 48, lastName: 'Lannister', firstName: 'Jaime' },
    { id: 49, lastName: 'Stark', firstName: 'Arya' },
    { id: 50, lastName: 'Targaryen', firstName: 'Daenerys' },
    { id: 51, lastName: 'Snow', firstName: 'Jon' },
    { id: 52, lastName: 'Lannister', firstName: 'Cersei' },
    { id: 53, lastName: 'Lannister', firstName: 'Jaime' },
    { id: 54, lastName: 'Stark', firstName: 'Arya' },
    { id: 55, lastName: 'Targaryen', firstName: 'Daenerys' },
    { id: 56, lastName: 'Snow', firstName: 'Jon' },
    { id: 57, lastName: 'Lannister', firstName: 'Cersei' },
    { id: 58, lastName: 'Lannister', firstName: 'Jaime' },
    { id: 59, lastName: 'Stark', firstName: 'Arya' },
    { id: 60, lastName: 'Targaryen', firstName: 'Daenerys' },
    { id: 61, lastName: 'Snow', firstName: 'Jon' },
    { id: 62, lastName: 'Lannister', firstName: 'Cersei' },
    { id: 63, lastName: 'Lannister', firstName: 'Jaime' },
    { id: 64, lastName: 'Stark', firstName: 'Arya' },
    { id: 65, lastName: 'Targaryen', firstName: 'Daenerys' },
    { id: 66, lastName: 'Snow', firstName: 'Jon' },
    { id: 67, lastName: 'Lannister', firstName: 'Cersei' },
    { id: 68, lastName: 'Lannister', firstName: 'Jaime' },
    { id: 69, lastName: 'Stark', firstName: 'Arya' },
    { id: 70, lastName: 'Targaryen', firstName: 'Daenerys' },
    { id: 71, lastName: 'Snow', firstName: 'Jon' },
    { id: 72, lastName: 'Lannister', firstName: 'Cersei' },
    { id: 73, lastName: 'Lannister', firstName: 'Jaime' },
    { id: 74, lastName: 'Stark', firstName: 'Arya' },
    { id: 75, lastName: 'Targaryen', firstName: 'Daenerys' },
    { id: 76, lastName: 'Snow', firstName: 'Jon' },
    { id: 77, lastName: 'Lannister', firstName: 'Cersei' },
    { id: 78, lastName: 'Lannister', firstName: 'Jaime' },
    { id: 79, lastName: 'Stark', firstName: 'Arya' },
    { id: 80, lastName: 'Targaryen', firstName: 'Daenerys' },
    { id: 81, lastName: 'Snow', firstName: 'Jon' },
    { id: 82, lastName: 'Lannister', firstName: 'Cersei' },
    { id: 83, lastName: 'Lannister', firstName: 'Jaime' },
    { id: 84, lastName: 'Stark', firstName: 'Arya' },
    { id: 85, lastName: 'Targaryen', firstName: 'Daenerys' },
    { id: 86, lastName: 'Snow', firstName: 'Jon' },
    { id: 87, lastName: 'Lannister', firstName: 'Cersei' },
    { id: 88, lastName: 'Lannister', firstName: 'Jaime' },
    { id: 89, lastName: 'Stark', firstName: 'Arya' },
    { id: 90, lastName: 'Targaryen', firstName: 'Daenerys' },
    { id: 91, lastName: 'Snow', firstName: 'Jon' },
    { id: 92, lastName: 'Lannister', firstName: 'Cersei' },
    { id: 93, lastName: 'Lannister', firstName: 'Jaime' },
    { id: 94, lastName: 'Stark', firstName: 'Arya' },
    { id: 95, lastName: 'Targaryen', firstName: 'Daenerys' },
    { id: 96, lastName: 'Snow', firstName: 'Jon' },
    { id: 97, lastName: 'Lannister', firstName: 'Cersei' },
    { id: 98, lastName: 'Lannister', firstName: 'Jaime' },
    { id: 99, lastName: 'Stark', firstName: 'Arya' },
    { id: 100, lastName: 'Targaryen', firstName: 'Daenerys' },
    { id: 101, lastName: 'Targaryen', firstName: 'Daenerys' },
    { id: 102, lastName: 'Snow', firstName: 'Jon' },
  ];



  return (
    <Layout pageTitle='Other Grid test'>
      <AppDataGrid title='Test Data-Grid' rows={rows} columns={columns} height='20rem'/>
    </Layout>
  )
}


