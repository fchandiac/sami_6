
// const config = require('../config.json')
// const url = config.api.url

import electron from 'electron'
const ipcRenderer = electron.ipcRenderer || false

function create(name) {
    let data = { name }
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const category = new Promise((resolve, reject) => {
        fetch(url + 'categories/create', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        }).then(res => {
            res.json().then(res => {
                if (res.code === 0) {
                    reject(res.data)
                } else {
                    resolve(res.data)
                }
            })
        }).catch(err => { reject(err) })
    })
    return category
}


function findAll() {
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const category = new Promise((resolve, reject) => {
        fetch(url + 'categories/findAll', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        }).then(res => {
            res.json().then(res => {
                if (res.code === 0) {
                    reject(res.data)
                } else {
                    resolve(res.data)
                }
            })
        }).catch(err => { reject(err) })
    })
    return category
}

function destroy(id) {
    let data = { id }
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const category = new Promise((resolve, reject) => {
        fetch(url + 'categories/destroy', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        }).then(res => {
            res.json().then(res => {
                if (res.code === 0) {
                    reject(res.data)
                } else {
                    resolve(res.data)
                }
            })
        }).catch(err => { reject(err) })
    })
    return category
}


export { create, findAll, destroy}