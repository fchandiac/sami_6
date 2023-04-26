const config = require('../config.json')
const url = "http://localhost:3001/"

function ticket(total, cart, ticketInfo, printerInfo) {
    let data = { total, cart, ticketInfo, printerInfo }
    const print = new Promise((resolve, reject) => {
        fetch(url + 'print/ticket', {
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
    return print
}


export { ticket }