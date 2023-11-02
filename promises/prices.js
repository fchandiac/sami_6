
// const config = require('../config.json')
// const url = config.api.url

import electron from 'electron'
const ipcRenderer = electron.ipcRenderer || false

function create(tax_id, sale, purchase) {
    let data = { tax_id, sale, purchase }
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const price = new Promise((resolve, reject) => {
        fetch(url + 'prices/create', {
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

export { create }