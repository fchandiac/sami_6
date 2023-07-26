import electron from 'electron'
const ipcRenderer = electron.ipcRenderer || false

function create(amount, detail, user_id, customer_id) {
    let data = { amount, detail, user_id, customer_id }
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const partial = new Promise((resolve, reject) => {
        fetch(url + 'partialpayments/create', {
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
    return partial
}

function findAllByPay(pay_id) {
    let data = { pay_id }
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const partial = new Promise((resolve, reject) => {
        fetch(url + 'partialpayments/findAllByPay', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        }).then(res => {
            console.log(res)
            res.json().then(res => {
                if (res.code === 0) {
                    reject(res.data)
                } else {
                    resolve(res.data)
                }
            })
        }).catch(err => { reject(err) })
    })
    return partial
}


   
export { create, findAllByPay }
