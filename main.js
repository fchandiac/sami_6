const { app, BrowserWindow, ipcMain, net } = require('electron')
const path = require('path')
const fs = require('fs')
const url = require('url')
const port = 3001


const hddSerial = require('hddserial');

hddSerial.one(1, function (err, serial) {
	console.log("hdd serial for first hdd : %s", serial);
});



///// --------> NODE ENV <-------/////////
const env = process.env.NODE_ENV
//const env = 'build'
///// --------------------------/////////



///// --------> EXPRESS CONFIG <-------/////////
const express = require('express');
const exp = express()
const cors = require('cors');
exp.set('json spaces', 2); // Permite la generacion de Json como res de express... eso creo
exp.use(express.json())
exp.use(express.urlencoded({ extended: false }))
exp.use(cors({ origin: '*' })) // permite acceso de otros clientes dentro de la red
exp.use(express.static(path.join(__dirname, './out')))

///// --------> EXPRESS PRINTER <-------/////////
exp.use(require('./printerRoute'))

exp.get('/', (req, res) => {
	res.send('Server Work')
})

exp.listen(port, () => {
	console.log('app listening at http://localhost:' + port)
})


/////// --------> ELECTRON CONFIG <-------/////////
const createWindow = () => {
	var win = new BrowserWindow({
		width: 1920,
		height: 1080,
		minWidth: 800,
		minHeight: 600,
		webPreferences: {
			contextIsolation: false,
			nodeIntegration: true,
			enableRemoteModule: true,
			webSecurity: false
		},
	})
	var splash = new BrowserWindow({
		width: 500,
		height: 375,
		frame: false,
		alwaysOnTop: true
	})
	win.hide()
	splash.center()
	splash.hide()
	if (env == 'build') {
		splash.center()
		win.loadURL('http://localhost:' + port)
		splash.loadURL(url.format({
			pathname: path.join(__dirname, './splash/splash.html'),
			protocol: 'file',
			slashes: true
		}))
		setTimeout(function () {
			splash.show()
			setTimeout(function () {
				splash.close();
				win.maximize()
				win.show();
			}, 6000);
		}, 2000)
	} else {
		ejecuteNext(win, splash)
	}
}

// Verifica si hay otra instancia de la aplicación
// Si hay otra instancia de la aplicación, cierra esta instancia
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
	app.quit()
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
	app.quit()
})

function ejecuteNext(win, splash) {
	/////// --------> NEXT SERVER <-------/////////
	const { createServer } = require('http');
	const next = require('next');
	const dev = env !== 'production';
	const nextApp = next({ dev });
	const handler = nextApp.getRequestHandler();
	win.hide()
	splash.hide()
	splash.center()

	nextApp
		.prepare()
		.then(() => {
			const server = createServer((req, res) => {
				if (req.headers['user-agent'].indexOf('Electron') === -1) {
					res.writeHead(404);
					res.end()
					return
				}
				return handler(req, res);
			});
			server.listen(3000, (error) => {
				if (error) throw error
			})
			if (dev) {
				win.webContents.openDevTools();
			}
			win.loadURL('http://localhost:3000')

			win.on('close', () => {
				win = null;
				server.close();
			});
			splash.loadURL(url.format({
				pathname: path.join(__dirname, './splash/splash.html'),
				protocol: 'file',
				slashes: true
			}))
			setTimeout(function () {
				splash.show()
				setTimeout(function () {
					splash.close();
					win.maximize()
					win.show();
				}, 6000);
			}, 2000)
		})
}



/////// --------> IPC COMMUNICATION <-------/////////
const filePathConfig = path.join(__dirname, './config.json')
const filePathMovements = path.join(__dirname, './movements.json')

ipcMain.on('read-config', (e, arg) => {
	let rawDataConfig = fs.readFileSync(filePathConfig)
	let config = JSON.parse(rawDataConfig)
	e.returnValue = config
})

ipcMain.on('get-payment-methods', (e, arg) => {
	let rawDataConfig = fs.readFileSync(filePathConfig)
	let config = JSON.parse(rawDataConfig)
	e.returnValue = config.payment_methods
})

ipcMain.on('get-customer-credit', (e, arg) => {
	let rawDataConfig = fs.readFileSync(filePathConfig)
	let config = JSON.parse(rawDataConfig)
	e.returnValue = config.customer_credit
})

ipcMain.on('update-customer-credit', (e, arg) => {
	let rawDataConfig = fs.readFileSync(filePathConfig)
	let config = JSON.parse(rawDataConfig)
	config.customer_credit = arg
	data = JSON.stringify(config)
	fs.writeFileSync(filePathConfig, data)
})

ipcMain.on('update-payment-methods', (e, arg) => {
	let rawDataConfig = fs.readFileSync(filePathConfig)
	let config = JSON.parse(rawDataConfig)
	config.payment_methods = arg
	data = JSON.stringify(config)
	fs.writeFileSync(filePathConfig, data)
})

ipcMain.on('get-admin-pass', (e, arg) => {
	let rawDataConfig = fs.readFileSync(filePathConfig)
	let config = JSON.parse(rawDataConfig)
	e.returnValue = config.admin_pass
})

ipcMain.on('update-admin-pass', (e, arg) => {
	let rawDataConfig = fs.readFileSync(filePathConfig)
	let config = JSON.parse(rawDataConfig)
	config.admin_pass = arg
	data = JSON.stringify(config)
	fs.writeFileSync(filePathConfig, data)
})

ipcMain.on('get-cash-register-UI', (e, arg) => {
	let rawDataConfig = fs.readFileSync(filePathConfig)
	let config = JSON.parse(rawDataConfig)
	e.returnValue = config.cash_register_UI
})

ipcMain.on('update-cash-register-UI', (e, arg) => {
	let rawDataConfig = fs.readFileSync(filePathConfig)
	let config = JSON.parse(rawDataConfig)
	config.cash_register_UI = arg
	data = JSON.stringify(config)
	fs.writeFileSync(filePathConfig, data)
})

ipcMain.on('get-printer', (e, arg) => {
	let rawDataConfig = fs.readFileSync(filePathConfig)
	let config = JSON.parse(rawDataConfig)
	e.returnValue = config.printer
})

ipcMain.on('update-printer', (e, arg) => {
	let rawDataConfig = fs.readFileSync(filePathConfig)
	let config = JSON.parse(rawDataConfig)
	config.printer = arg
	data = JSON.stringify(config)
	fs.writeFileSync(filePathConfig, data)
})

ipcMain.on('get-ticket-info', (e, arg) => {
	let rawDataConfig = fs.readFileSync(filePathConfig)
	let config = JSON.parse(rawDataConfig)
	e.returnValue = config.ticket_info
})

ipcMain.on('update-ticket-info', (e, arg) => {
	let rawDataConfig = fs.readFileSync(filePathConfig)
	let config = JSON.parse(rawDataConfig)
	config.ticket_info = arg
	data = JSON.stringify(config)
	fs.writeFileSync(filePathConfig, data)
})

ipcMain.on('get-api-url', (e, arg) => {
	let rawDataConfig = fs.readFileSync(filePathConfig)
	let config = JSON.parse(rawDataConfig)
	e.returnValue = config.api.url
})

ipcMain.on('update-api-url', (e, arg) => {
	let rawDataConfig = fs.readFileSync(filePathConfig)
	let config = JSON.parse(rawDataConfig)
	config.api.url = arg
	data = JSON.stringify(config)
	fs.writeFileSync(filePathConfig, data)
})

ipcMain.on('get-movements', (e, arg) => {
	let rawDataConfig = fs.readFileSync(filePathMovements)
	let movements = JSON.parse(rawDataConfig)
	e.returnValue = movements
})

ipcMain.on('update-movements', (e, arg) => {
	data = JSON.stringify(arg)
	fs.writeFileSync(filePathMovements, data)
})

ipcMain.on('get-docs', (e, arg) => {
	let rawDataConfig = fs.readFileSync(filePathConfig)
	let config = JSON.parse(rawDataConfig)
	e.returnValue = config.docs
})

ipcMain.on('update-docs', (e, arg) => {
	let rawDataConfig = fs.readFileSync(filePathConfig)
	let config = JSON.parse(rawDataConfig)
	config.docs = arg
	data = JSON.stringify(config)
	fs.writeFileSync(filePathConfig, data)
})

ipcMain.on('get-lioren', (e, arg) => {
	let rawDataConfig = fs.readFileSync(filePathConfig)
	let config = JSON.parse(rawDataConfig)
	e.returnValue = config.lioren
})

ipcMain.on('update-lioren', (e, arg) => {
	let rawDataConfig = fs.readFileSync(filePathConfig)
	let config = JSON.parse(rawDataConfig)
	config.lioren = arg
	data = JSON.stringify(config)
	fs.writeFileSync(filePathConfig, data)
})

ipcMain.handle('connection', (e, arg) => {
	let conn = net.isOnline()
	console.log('WebConnection: ', conn)
	return conn
})


/////// --------> IPC PRINTER <-------/////////
const escpos = require('escpos')
escpos.USB = require('escpos-usb')
const usb = require('usb')
const { electron } = require('process')

ipcMain.handle('find-printer', (e, printer) => {
	try {
		let devices = usb.getDeviceList()
		const idVendor = parseInt(printer.idVendor)
		const idProduct = parseInt(printer.idProduct)

		const device = devices.find(dev => dev.deviceDescriptor.idVendor === idVendor && dev.deviceDescriptor.idProduct === idProduct);

		if (device) {
			console.log('Dispositivo idVendor: ' + idVendor + ' idProduct: ' + idProduct + ' encontrado')
			return true
		} else {
			console.log('Dispositivo idVendor: ' + idVendor + ' idProduct: ' + idProduct + '  no encontrado')
			return false
		}
	} catch (err) {
		console.log(err)
		return false
	}
})


ipcMain.on('print-ticket', (e, printInfo) => {
	const device = new escpos.USB(printInfo.printer.idVendor, printInfo.printer.idProduct)
	const options = { encoding: "GB18030" /* delt */ }
	const printer = new escpos.Printer(device, options)
	let total = printInfo.total
	let name = printInfo.ticketInfo.name
	let rut = printInfo.ticketInfo.rut
	let address = printInfo.ticketInfo.address
	let phone = printInfo.ticketInfo.phone
	let cart = printInfo.cart
	let paymentMethod = printInfo.paymentMethod

	device.open(function () {
		printer.font('b').align('ct').style('NORMAL')
		printer.size(0, 0)
		printer.text('_________________________________________')
		printer.size(1, 0)
		printer.text('TICKET DE VENTA')
		printer.size(0, 0)
		printer.text('_________________________________________')
		printer.text(name)
		printer.text(rut)
		printer.text(address)
		printer.text(phone)
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
		printer.size(1, 0)
		printer.text('')
		printer.text('TOTAL: ' + renderMoneystr(total))
		printer.size(0, 0)
		printer.text('Medio de pago: ' + paymentMethod)
		printer.text('')
		printer.text('')
		printer.text('fecha: ' + printInfo.date + ' hora: ' + printInfo.time)
		printer.align('ct')

		printer.text('Gracias por su compra')
		printer.text('')
		printer.cut()
		printer.close()
	})
	device.close()
	e.returnValue = true

})

ipcMain.on('boleta', (e, printInfo) => {
	const device = new escpos.USB(printInfo.printer.idVendor, printInfo.printer.idProduct)
	const options = { encoding: "GB18030" /* delt */ }
	const printer = new escpos.Printer(device)
	let stamp = printInfo.stamp
	let total = printInfo.total
	let invoiceNumber = printInfo.invoiceNumber
	let iva = printInfo.iva
	let name = printInfo.name
	let rut = printInfo.rut
	let address = printInfo.address
	let phone = printInfo.phone
	let cart = printInfo.cart

	escpos.Image.load(stamp, function (image) {
		device.open(function () {
			printer.font('b').align('ct').style('NORMAL')
			printer.size(0, 0)
			printer.text('_________________________________________')
			printer.size(1, 0)
			printer.text('BOLETA ELECTRONICA')
			printer.size(0, 0)
			printer.text('Nro: ' + invoiceNumber)
			printer.text('_________________________________________')
			printer.text(name)
			printer.text(rut)
			printer.text(address)
			printer.text(phone)
			printer.text('_________________________________________')
			printer.size(0, 0)
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
			printer.size(1, 0)
			printer.text('')
			printer.text('TOTAL: ' + renderMoneystr(total))
			printer.size(0, 0)
			printer.text('El iva de esta boleta es: ' + renderMoneystr(parseInt(iva)))
			printer.text('')
			printer.text('fecha: ' + printInfo.date + ' hora: ' + printInfo.time)
			printer.align('ct')
			printer.image(image, 'd24')
				.then(() => {
					printer.text('Timbre Electronico SII')
					printer.text('Res. Nro 80 de 2014-08-22')
					printer.text('Verifique Documento en www.lioren.cl/consultabe')
					printer.text('')
					printer.cut()
					printer.close()
				})

		})
		device.close()
	})
	e.returnValue = true
})




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