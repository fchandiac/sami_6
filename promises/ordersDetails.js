
// const config = require('../config.json')
// const url = config.api.url

import electron from 'electron'
const ipcRenderer = electron.ipcRenderer || false

function create(order_id, product_id, quanty, sale,  discount, subtotal, name) {
    let data = { order_id, product_id, quanty, sale,  discount, subtotal, name }
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const detail = new Promise((resolve, reject) => {
        fetch(url + 'ordersDetails/create', {
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
    return detail
}

export { create }
