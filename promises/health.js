const config = require('../config.json')
const url = config.api.url

export default function health() {
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