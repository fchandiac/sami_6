import electron from 'electron'
const ipcRenderer = electron.ipcRenderer || false

function create(amount, payment_method, dte_code, dte_number) {
    let data = {amount, payment_method, dte_code, dte_number }
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

export { create }