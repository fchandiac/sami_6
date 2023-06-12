import electron from 'electron'
const ipcRenderer = electron.ipcRenderer || false

function login(user, pass) {
    let data = { user, pass }
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const user_ = new Promise((resolve, reject) => {
        fetch(url + 'users/login', {
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
    return user_
}


function updatePass(id, old_pass, new_pass) {
    let data = { id, old_pass, new_pass }
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const user_ = new Promise((resolve, reject) => {
        fetch(url + 'users/updatePass', {
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
    return user_
}


function create(user, name, pass, profile_id) {
    let data = { user, name, pass, profile_id }
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const user_ = new Promise((resolve, reject) => {
        fetch(url + 'users/create', {
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
    return user_
}


function findAll() {
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const user = new Promise((resolve, reject) => {
        fetch(url + 'users/findAll', {
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
    return user
}


function destroy(id) {
    let data = { id }
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const user_ = new Promise((resolve, reject) => {
        fetch(url + 'users/destroy', {
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
    return user_
}



export { login, updatePass, create, findAll, destroy }