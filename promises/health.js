import electron from 'electron'
const ipcRenderer = electron.ipcRenderer || false

function test() {
    const url = ipcRenderer.sendSync('get-api-url', 'sync')
    const health = new Promise((resolve, reject) => {
        fetch(url + 'health', {
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
    return health
}

export { test }