import electron from 'electron'
const ipcRenderer = electron.ipcRenderer || false

function create(name) {
    let data = { name }
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const category = new Promise((resolve, reject) => {
        fetch(url + 'profiles/create', {
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
    return profile
}


function findAll() {
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const profile = new Promise((resolve, reject) => {
        fetch(url + 'profiles/findAll', {
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
    return profile
}

function destroy(id) {
    let data = { id }
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const profile = new Promise((resolve, reject) => {
        fetch(url + 'profiles/destroy', {
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
    return profile
}


export { create, findAll, destroy}