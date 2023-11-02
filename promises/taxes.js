import electron from 'electron'
const ipcRenderer = electron.ipcRenderer || false


function findAll() {
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const tax = new Promise((resolve, reject) => {
        fetch(url + 'taxes/findAll', {
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
    return tax
}

export {findAll}