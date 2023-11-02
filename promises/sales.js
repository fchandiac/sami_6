import electron from 'electron'
const ipcRenderer = electron.ipcRenderer || false

function create(amount, payment_method, dte_code, dte_number, stock_control, user_id) {
    let data = { amount, payment_method, dte_code, dte_number, stock_control, user_id }
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const sale = new Promise((resolve, reject) => {
        fetch(url + 'sales/create', {
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
    return sale
}



function findOneById(id) {
    let data = { id }
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const sale = new Promise((resolve, reject) => {
        fetch(url + 'sales/findOneById', {
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
    return sale
}




function findAllBetweenDates(start, end) {
    let data = { start, end }
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const sale = new Promise((resolve, reject) => {
        fetch(url + 'sales/findAllBetweenDates', {
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
    return sale
}

function destroy(id) {
    let data = { id }
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const sale = new Promise((resolve, reject) => {
        fetch(url + 'sales/destroy', {
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
    return sale
}



function findAllBetweenDateGroupByDate(start, end) {
    let data = { start, end}
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const sale = new Promise((resolve, reject) => {
        fetch(url + 'sales/findAllBetweenDateGroupByDate', {
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
    return sale
}

function findAllBetweenDateGroupByPayment(start, end) {
    let data = { start, end}
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const sale = new Promise((resolve, reject) => {
        fetch(url + 'sales/findAllBetweenDateGroupByPayment', {
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
    return sale
}





function findAllBetweenDateGroupByDte(start, end) {
    let data = { start, end}
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const sale = new Promise((resolve, reject) => {
        fetch(url + 'sales/findAllBetweenDateGroupByDte', {
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
    return sale
}

export { 
    create, 
    findOneById, 
    findAllBetweenDates, 
    destroy, 
    findAllBetweenDateGroupByDate,
    findAllBetweenDateGroupByPayment,
    findAllBetweenDateGroupByDte
}