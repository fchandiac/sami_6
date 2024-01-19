import React, { useState, useEffect } from 'react'
import electron from 'electron'
const ipcRenderer = electron.ipcRenderer || false

function useLioren() {
    const [token, setToken] = useState('')

    useEffect(() => {
        let token = ipcRenderer.sendSync('get-lioren', 'sync').token
        setToken(token)
    }, [])

    const getToken = () => token


    return { getToken }
}


export default useLioren

