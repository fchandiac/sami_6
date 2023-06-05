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


export { create, findAll }