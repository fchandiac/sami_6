import electron from 'electron'
const ipcRenderer = electron.ipcRenderer || false

function create() {
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const order = new Promise((resolve, reject) => {
        fetch(url + 'orders/create', {
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
    return order
}


function findAll() {
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const order = new Promise((resolve, reject) => {
        fetch(url + 'orders/findAll', {
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
    return order
}

function updateState(id, state) {
    let data = { id, state}
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const order = new Promise((resolve, reject) => {
        fetch(url + 'orders/updateState', {
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
    return order
}

function destroy(id) {
    let data = { id}
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const order = new Promise((resolve, reject) => {
        fetch(url + 'orders/destroy', {
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
    return order
}




function findOneById(id) {
    let data = { id}
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const order = new Promise((resolve, reject) => {
        fetch(url + 'orders/findOneById', {
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
    return order
}



export { create, findAll, updateState, destroy, findOneById }