const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const url = require('url')
const port = 3001




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






