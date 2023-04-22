const config = require('../config.json')
const url = config.api.url

function create(name) {
    let data = { name }
    const category = new Promise((resolve, reject) => {
        fetch(url + 'categories/create', {
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
    return category
}
function findAll() {
    const product = new Promise((resolve, reject) => {
        fetch(url + 'categories/findAll', {
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
    return product
}


export { create, findAll}