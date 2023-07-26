import electron from 'electron'
const ipcRenderer = electron.ipcRenderer || false

function create(sale_id, customer_id, amount, payment_method, state, date, paid, balance) {
    let data = {sale_id, customer_id, amount, payment_method, state , date, paid, balance}
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



function updateState(id, state) {
    let data = {id, state}
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const pay = new Promise((resolve, reject) => {
        fetch(url + 'pays/updateState', {
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


function findAllBetweenDates(start, end) {
    let data = {start, end}
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const pay = new Promise((resolve, reject) => {
        fetch(url + 'pays/findAllBetweenDates', {
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


function findAllByCustomerId(customer_id) {
    let data = {customer_id}
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const pay = new Promise((resolve, reject) => {
        fetch(url + 'pays/findAllByCustomerId', {
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


function addPaid(id, paid) {
    let data = {id, paid}
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const pay = new Promise((resolve, reject) => {
        fetch(url + 'pays/addPaid', {
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

export { create, findAll, updateState, findAllBetweenDates, addPaid, findAllByCustomerId }