import electron from 'electron'
const ipcRenderer = electron.ipcRenderer || false


function create(rut, name, activity, district, city, address) {
    let data = { rut, name, activity, district, city, address }
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const customer = new Promise((resolve, reject) => {
        fetch(url + 'customers/create', {
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
    return customer
}

function findAll() {
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const customer = new Promise((resolve, reject) => {
        fetch(url + 'customers/findAll', {
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
    return customer
}



function findOneByRut(rut) {
    let data = { rut }
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const customer = new Promise((resolve, reject) => {
        fetch(url + 'customers/findOneByRut', {
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
    return customer
}

function update(id, rut, name, activity,  district, city, address) {
    let data = { id, rut, name, activity,  district, city, address }
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const customer = new Promise((resolve, reject) => {
        fetch(url + 'customers/findOneByRut', {
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
    return customer
}

export {create, findAll, findOneByRut, update}