const express = require('express')
const router = express.Router()
const escpos = require('escpos')
const moment = require('moment')
escpos.USB = require('escpos-usb')



router.post('/print/test', (req, res) => {
    test(req.body.printerInfo)
        .then(() => {
            res.json({ status: 'success' })
        })
        .catch(err => {
            console.log(err)
            res.json(err)
        })
})

router.post('/print/ticket', (req, res) => {
    ticket(req.body.total, req.body.cart, req.body.ticketInfo, req.body.printerInfo)
        .then(() => {
            res.json({ status: 'success' })
        }).catch(err => {
            console.log(err)
            res.json(err)
        })
})

router.post('/print/quote', (req, res) => {
    quote(req.body.total, req.body.cart, req.body.ticketInfo, req.body.printerInfo)
        .then(() => {
            res.json({ status: 'success' })
        }).catch(err => {
            console.log(err)
            res.json(err)
        })
})

function ticket(total, cart, ticketInfo, printerInfo) {
    const print = new Promise((resolve, reject) => {
        try {
            const device = new escpos.USB(parseInt(printerInfo.idVendor), parseInt(printerInfo.idProduct))
            const options = { encoding: "GB18030" /* default */ }
            const printer = new escpos.Printer(device, options)
            device.open(function (error) {
                printer.font('b').align('ct').style('NORMAL')
                printer.size(0, 0)
                printer.text('TICKET')
                printer.text(ticketInfo.name)
                printer.text(ticketInfo.rut)
                printer.text(ticketInfo.address)
                printer.text(ticketInfo.phone)
                printer.text('_________________________________________')
                printer.tableCustom([
                    { text: '#', align: "LEFT", width: 0.1 },
                    { text: 'Producto', align: "LEFT", width: 0.8 },
                    { text: 'Subtotal', align: "LEFT", width: 0.2 }
                ])

                cart.map(product => {
                    printer.tableCustom([
                        { text: product.quanty, align: "LEFT", width: 0.1 },
                        { text: product.name, align: "LEFT", width: 0.8 },
                        { text: renderMoneystr(product.subTotal), align: "LEFT", width: 0.2 }
                    ])
                })

                printer.text('TOTAL: ' + renderMoneystr(total))
                printer.text('')
                let today = new Date()
                let date = moment(today).format('DD-MM-yyyy')
                let time = moment(today).format('HH:mm:ss')
                let date_line = 'fecha: ' + date + ' hora: ' + time
                printer.text(date_line)
                printer.text('')
                printer.cut()
                printer.cashdraw(2)
                printer.flush()
                printer.close()
            })
            resolve({ 'code': 1, 'data': 'success' })

        } catch (err) {
            reject({ 'code': 0, 'data': err })
        }
    })
    return print
}

function quote(total, cart, ticketInfo, printerInfo) {
    const print = new Promise((resolve, reject) => {
        try {
            const device = new escpos.USB(parseInt(printerInfo.idVendor), parseInt(printerInfo.idProduct))
            const options = { encoding: "GB18030" /* default */ }
            const printer = new escpos.Printer(device, options)
            device.open(function (error) {
                printer.font('b').align('ct').style('NORMAL')
                printer.size(0, 0)
                printer.text('COTIZACION')
                printer.text(ticketInfo.name)
                printer.text(ticketInfo.rut)
                printer.text(ticketInfo.address)
                printer.text(ticketInfo.phone)
                printer.text('_________________________________________')
                printer.tableCustom([
                    { text: '#', align: "LEFT", width: 0.1 },
                    { text: 'Producto', align: "LEFT", width: 0.8 },
                    { text: 'Subtotal', align: "LEFT", width: 0.2 }
                ])

                cart.map(product => {
                    printer.tableCustom([
                        { text: product.quanty, align: "LEFT", width: 0.1 },
                        { text: product.name, align: "LEFT", width: 0.8 },
                        { text: renderMoneystr(product.subTotal), align: "LEFT", width: 0.2 }
                    ])
                })

                printer.text('TOTAL: ' + renderMoneystr(total))
                printer.text('')
                let today = new Date()
                let date = moment(today).format('DD-MM-yyyy')
                let time = moment(today).format('HH:mm:ss')
                let date_line = 'fecha: ' + date + ' hora: ' + time
                printer.text(date_line)
                printer.text('')
                printer.cut()
                printer.size(0, 0)
                printer.close()
            })
            resolve({ 'code': 1, 'data': 'success' })

        } catch (err) {
            reject({ 'code': 0, 'data':{ err , printerInfo}})
        }
    })
    return print
}

function test(printerInfo) {
    const print = new Promise((resolve, reject) => {
        try {
            const device = new escpos.USB(printerInfo.idVendor, printerInfo.idProduct)
            const options = { encoding: "GB18030" /* default */ }
            const printer = new escpos.Printer(device, options)
            device.open(function (error) {
                resolve({ code: 1, data: 'success' })
            })
        } catch (err) {
            reject({ code: 0, data: err })
        }
    })
    return print
}

function renderMoneystr(value) {
    if (value < 0) {
        value = value.toString()
        value = value.replace(/[^0-9]/g, '')
        value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
        value = '$ -' + value
        return value
    } else {
        value = value.toString()
        value = value.replace(/[^0-9]/g, '')
        value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
        value = '$ ' + value
        return value
    }
}


module.exports = router