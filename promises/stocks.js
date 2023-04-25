const config = require('../config.json')
const url = config.api.url



function create(product_id, storage_id , stock, critical_stock) {
    let data = { product_id, storage_id , stock, critical_stock }
    const price = new Promise((resolve, reject) => {
        fetch(url + 'stocks/create', {
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