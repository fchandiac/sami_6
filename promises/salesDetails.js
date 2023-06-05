import electron from 'electron'
const ipcRenderer = electron.ipcRenderer || false

function create(sale_id, product_id, quanty, sale,  discount, subtotal, name) {
    let data = {sale_id, product_id, quanty, sale,  discount, subtotal, name }
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const detail = new Promise((resolve, reject) => {
        fetch(url + 'salesDetails/create', {
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
    return  detail
}


function findAllBySale(sale_id) {
    let data = {sale_id }
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const detail = new Promise((resolve, reject) => {
        fetch(url + 'salesDetails/findAllBySale', {
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
    return  detail
}



function findAllBetweenDateGroupByProduct(start, end) {
    let data = {start, end }
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const detail = new Promise((resolve, reject) => {
        fetch(url + 'salesDetails/findAllBetweenDateGroupByProduct', {
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
    return  detail
}
export { create, findAllBySale, findAllBetweenDateGroupByProduct }