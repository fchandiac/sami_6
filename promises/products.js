const config = require('../config.json')
const url = config.api.url


function create(name, code, category_id, price_id) {
    let data = { name, code, category_id, price_id }
    const product = new Promise((resolve, reject) => {
        fetch(url + 'products/create', {
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
    return product
}

function findAll() {
    const product = new Promise((resolve, reject) => {
        fetch(url + 'products/findAll', {
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



function findOneByName(name) {
    let data = { name }
    const product = new Promise((resolve, reject) => {
        fetch(url + 'products/findOneByName', {
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
    return product
}



function updateFavorite(id, favorite) {
    let data = { id, favorite }
    const product = new Promise((resolve, reject) => {
        fetch(url + 'products/updateFavorite', {
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
    return product
}


function updateFull(id, name, code, category_id, price_id) {
    let data = { id, name, code, category_id, price_id }
    const product = new Promise((resolve, reject) => {
        fetch(url + 'products/updateFull', {
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
    return product
}

function findOneByCode(code) {
    let data = {code}
    const product = new Promise((resolve, reject) => {
        fetch(url + 'products/findOneByCode', {
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
    return product
}

function findOneById(id) {
    let data = {id}
    const product = new Promise((resolve, reject) => {
        fetch(url + 'products/findOneById', {
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
    return product
}

function destroy(id) {
    let data = {id}
    const product = new Promise((resolve, reject) => {
        fetch(url + 'products/destroy', {
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
    return product
}


export {findAll, create, findOneByName, updateFavorite, updateFull, findOneByCode, findOneById, destroy}