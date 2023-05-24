// const config = require('../config.json')
// const url = config.api.url

import electron from 'electron'
const ipcRenderer = electron.ipcRenderer || false


function create(name, code, sale, purchase, category_id, tax_id) {
    let data = { name, code, sale, purchase, category_id, tax_id }
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const product = new Promise((resolve, reject) => {
        fetch(url + 'products/create', {
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
    return product
}


function findAll() {
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const product = new Promise((resolve, reject) => {
        fetch(url + 'products/findAll', {
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
    return product
}



function findOneByName(name) {
    let data = { name }
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const product = new Promise((resolve, reject) => {
        fetch(url + 'products/findOneByName', {
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
    return product
}



function updateFavorite(id, favorite) {
    let data = { id, favorite }
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const product = new Promise((resolve, reject) => {
        fetch(url + 'products/updateFavorite', {
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
    return product
}


function updateFull(id, name, code, category_id, tax_id, sale, purchase) {
    let data = {id, name, code, category_id, tax_id, sale, purchase }
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const product = new Promise((resolve, reject) => {
        fetch(url + 'products/updateFull', {
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
    return product
}

function findOneByCode(code) {
    let data = { code }
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const product = new Promise((resolve, reject) => {
        fetch(url + 'products/findOneByCode', {
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
    return product
}

function findOneById(id) {
    let data = { id }
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const product = new Promise((resolve, reject) => {
        fetch(url + 'products/findOneById', {
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
    return product
}

function destroy(id) {
    let data = { id }
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const product = new Promise((resolve, reject) => {
        fetch(url + 'products/destroy', {
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
    return product
}



function updateStockControl(id, stock_control) {
    let data = { id, stock_control }
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const product = new Promise((resolve, reject) => {
        fetch(url + 'products/updateStockControl', {
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
    return product
}


export {
    findAll,
    create,
    findOneByName,
    updateFavorite,
    updateFull,
    findOneByCode,
    findOneById,
    destroy,
    updateStockControl
}