import electron from 'electron'
const ipcRenderer = electron.ipcRenderer || false

function create(sale_id, customer_id, amount, payment_method, state, date) {
    let data = {sale_id, customer_id, amount, payment_method, state , date}
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const pay = new Promise((resolve, reject) => {
        fetch(url + 'pays/create', {
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
    return pay
}

function findAll() {
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const pay = new Promise((resolve, reject) => {
        fetch(url + 'pays/findAll', {
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
    return pay
}

export { create, findAll }