// const config = require('../config.json')
// const url = config.api.url

import electron from 'electron'
const ipcRenderer = electron.ipcRenderer || false

function create(product_id, storage_id , stock, critical_stock) {
    let data = { product_id, storage_id , stock, critical_stock }
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const stk = new Promise((resolve, reject) => {
        fetch(url + 'stocks/create', {
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
    return stk
}

function  storagesFindAll() {
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const store = new Promise((resolve, reject) => {
        fetch(url + 'storages/findAll', {
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
    return store
}

function createStorage(name) {
    let data = { name }
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const stk = new Promise((resolve, reject) => {
        fetch(url + 'storages/create', {
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
    return stk
}

function updateByProductAndStorage(product_id, storage_id, stock, critical_stock){
    let data = { product_id, storage_id, stock, critical_stock }
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const price = new Promise((resolve, reject) => {
        fetch(url + 'stocks/updateByProductAndStorage', {
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
    return price
}

function  findAllGroupByProduct() {
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const store = new Promise((resolve, reject) => {
        fetch(url + 'stocks/findAllGroupByProduct', {
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
    return store
}

function findAllByProductId(product_id){
    let data = { product_id}
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const price = new Promise((resolve, reject) => {
        fetch(url + 'stocks/findAllByProductId', {
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
    return price
}

function findOneByProductAndStorage(product_id, storage_id){
    let data = { product_id, storage_id}
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const price = new Promise((resolve, reject) => {
        fetch(url + 'stocks/findOneByProductAndStorage', {
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
    return price
}

function destroy(id){
    let data = { id}
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const price = new Promise((resolve, reject) => {
        fetch(url + 'stocks/destroy', {
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
    return price
}

function findAllByStorage(storage_id){
    let data = { storage_id}
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const price = new Promise((resolve, reject) => {
        fetch(url + 'stocks/findAllByStorage', {
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
    return price
}

function  findAllGroupByStorage() {
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const store = new Promise((resolve, reject) => {
        fetch(url + 'stocks/findAllGroupByStorage', {
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
    return store
}

function  findAllStockAlert() {
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const store = new Promise((resolve, reject) => {
        fetch(url + 'stocks/findAllStockAlert', {
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
    return store
}



export { 
    create, 
    storagesFindAll, 
    updateByProductAndStorage, 
    findAllGroupByProduct, 
    findAllByProductId,
    destroy,
    createStorage,
    findOneByProductAndStorage,
    findAllByStorage,
    findAllGroupByStorage,
    findAllStockAlert
}