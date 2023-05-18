

//const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI2MDkiLCJqdGkiOiJmNDQ4NWIxODBmNDVkNTQxMjhjMDljNjVjY2Y4ZDJhYWM0ODA3MzE0NjRkZWFjN2UwZDZiMjNmN2NmY2RmZGE4YmY1MDE2ZDAzMmEzNTQ4NiIsImlhdCI6MTY4Mzg0ODA4Ni42MDY2MTYsIm5iZiI6MTY4Mzg0ODA4Ni42MDY2MTgsImV4cCI6MTcxNTQ3MDQ4Ni42MDQwNTgsInN1YiI6IjU5NzYiLCJzY29wZXMiOltdfQ.K6GvR5-po-phzaseb7k0KG4z1ofzb3NRsaDXCcLZbQHhXNXholRHkw7GjRzax_52GkQ6_oxV6fabuEOFas_8dIl8ZAlHgS4t300TGMOfdNZzoBRIDVO9tHdT1RNeOOGFOMIGq8TkiGi6TS9zg9Yv9vOkPQG3Eslrxdgkg03b2VPa6aiRGSxfMRng0dnMifY-LtMgk1WVF9FZks1pL3EMJo19WXzkeqs6x-5KMZ96qp7Yxy644a-xG_rhWR0pIQ5_Zs2bYoViyiRPp59EGMZ7vLxX9TfLVgC0UqHAEEDMWDzL75H3vDUQe68KOAI3OAcqh3Kqp7nvgqNJCyjLn0wJeimjaxIZTUWIEYAY5Hw13OdLDNYbK2hgd546791BCBQ9_XZOTgz9CDp-SJd-uDmdjSgZ-0fqKJF8iwA9gdM-XeRWr19ne9peSWohhBUYwlA4BRSE12Rpsv64KJdBD1nyc_-x9taD-QEQf-QDbQGdwlteNj6r9jInfZMoytqp5_LKkU3TsPvpAa8gb5XlNIu8SwOVStoQdH9t2xKCChKFND5SIZUm1FL3TJL1V1Q-L65XydW5lKD5UmnQencnr7dxN6lTxZyZjtH6GBjyr1I2Xt5bQySSJPggcX4OZNaeATLlb50kyhuDiHb9CE4DEhsn6YQy_HA_I6CTeJhIn9o4BGg'

function boleta(token, total) {
    let data = {
        'emisor': { 'tipodoc': '39', 'servicio': 3 },
        'detalles': [{ 'codigo': '10001', 'nombre': 'Venta', 'cantidad': 1, 'precio': total, 'exento': false }],
        'expects': 'all'
    }
    const dte = new Promise((resolve, reject) => {
        fetch('https://www.lioren.cl/api/boletas', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }).then(res => {
            res.json().then(res => {
                let xml = res.xml
                let buff = Buffer.from(xml, 'base64');
                xml = buff
                var parseString = require('xml2js').parseString; // paso de xml a json
                parseString(xml, function (err, result) {
                    xml = result
                });

                let iva = xml.DTE.Documento[0].Encabezado[0].Totales[0].IVA[0]

                //--------- RUT EMISOR -----------//
                let RE = xml.DTE.Documento[0].TED[0].DD[0].RE[0]
                //--------- TIPO DOCUMENTO -----------//
                let TD = xml.DTE.Documento[0].TED[0].DD[0].TD[0]
                //--------- FOLIO -----------//
                let F = xml.DTE.Documento[0].TED[0].DD[0].F[0]
                //--------- FECHA -----------//
                let FE = xml.DTE.Documento[0].TED[0].DD[0].FE[0]
                //--------- RR -----------//
                let RR = xml.DTE.Documento[0].TED[0].DD[0].RR[0]
                //--------- RSR -----------//
                let RSR = xml.DTE.Documento[0].TED[0].DD[0].RSR[0]
                //--------- MONTO -----------//
                let MNT = xml.DTE.Documento[0].TED[0].DD[0].MNT[0]
                //--------- ITEM1 -----------//
                let IT1 = xml.DTE.Documento[0].TED[0].DD[0].IT1[0]
                //--------- TSTED -----------//
                let TSTED = xml.DTE.Documento[0].TED[0].DD[0].TSTED[0]
                //--------- CAF -----------//
                let CAF = xml.DTE.Documento[0].TED[0].DD[0].CAF[0]
                //--------- FRMT -----------//
                let FRMT = xml.DTE.Documento[0].TED[0].FRMT[0]._

                let timbre_str = '<TED version="1.0"><DD>' +
                    '<RE>' + RE + '</RE>' +
                    '<TD>' + TD + '</TD>' +
                    '<F>' + F + '</F>' +
                    '<FE>' + FE + '</FE>' +
                    '<RR>' + RR + '</RR>' +
                    '<RSR>' + RSR + '</RSR>' +
                    '<MNT>' + MNT + '</MNT>' +
                    '<IT1>' + IT1 + '</IT1>' +
                    '<CAF version="1.0"><DA>' +
                    '<RE>' + CAF.DA[0].RE[0] + '</RE>' +
                    '<RS>' + CAF.DA[0].RS[0] + '</RS>' +
                    '<TD>' + CAF.DA[0].TD[0] + '</TD>' +
                    '<RNG><D>' + CAF.DA[0].RNG[0].D[0] + '</D>' +
                    '<H>' + CAF.DA[0].RNG[0].H[0] + '</H></RNG>' +
                    '<FA>' + CAF.DA[0].FA[0] + '</FA>' +
                    '<RSAPK><M>' + CAF.DA[0].RSAPK[0].M[0] + '</M>' +
                    '<E>' + CAF.DA[0].RSAPK[0].E[0] + '</E></RSAPK>' +
                    '<IDK>' + CAF.DA[0].IDK[0] + '</IDK></DA>' +
                    '<FRMA algoritmo="SHA1withRSA">' + CAF.FRMA[0]._ + '</FRMA></CAF>' +
                    '<TSTED>' + TSTED + '</TSTED></DD>' +
                    '<FRMT algoritmo="SHA1withRSA">' + FRMT + '</FRMT></TED>'
                // console.log(timbre_str)
                resolve([timbre_str, iva, F])
                //console.log(xml.DTE.Documento[0])
            }).catch(err => {
                reject(err)
            })
        })
    })
    return dte
}


function miEmpresa() {
    const dte = new Promise((resolve, reject) => {
        fetch('https://www.lioren.cl/api/miempresa', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }).then(res => {
            res.json().then(res => {
                resolve(res)
            }).catch(err => {
                reject(err)
            })
        })
    })
    return dte
}

function receptor(rut) {
    const dte = new Promise((resolve, reject) => {
        const url = 'https://siichile.herokuapp.com/consulta?rut=76.118.195-5';
        fetch(url,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'X-Version': '0.1.4'
                }
            }
        )
            .then(res => {
                res.json().then(res => {
                    resolve(res)
                }).catch(err => {
                    reject(err)
                })
            })
    })
    return dte
}




function regiones(token) {
    const dte = new Promise((resolve, reject) => {
        fetch('https://www.lioren.cl/api/regiones', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }).then(res => {
            res.json().then(res => {
                resolve(res)
            }).catch(err => {
                reject(err)
            })
        })
    })
    return dte
}






function comunas(token) {
    const dte = new Promise((resolve, reject) => {
        fetch('https://www.lioren.cl/api/comunas', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }).then(res => {
            res.json().then(res => {
                resolve(res)
            }).catch(err => {
                reject(err)
            })
        })
    })
    return dte
}



function ciudades(token) {
    const dte = new Promise((resolve, reject) => {
        fetch('https://www.lioren.cl/api/ciudades', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }).then(res => {
            res.json().then(res => {
                resolve(res)
            }).catch(err => {
                reject(err)
            })
        })
    })
    return dte
}

const data = {
    "emisor": {
        "tipodoc": "33",
        "fecha": "2017-12-26"
    },
    "receptor": {
        "rut": "76684648-3",
        "rs": "LIOREN ENTERPRISES SPA",
        "giro": "SERVICIOS INFORMATICOS",
        "comuna": 95,
        "ciudad": 76,
        "direccion": "SANTO DOMINGO 1160 PISO 9"
    },
    "detalles": [
        {
            "codigo": "10000",
            "nombre": "Producto Afecto",
            "cantidad": 1,
            "precio": 12000,
            "exento": false
        }
    ],
    "expects": "all"
}

function factura(token, data) {

    const dte = new Promise((resolve, reject) => {

        fetch('https://www.lioren.cl/api/dtes', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }).then(res => {
            res.json().then(res => {
                resolve(res)
            }).catch(err => {
                reject(err)
            })
        })
    })
    return dte
}



function razonesRef(token) {
    const dte = new Promise((resolve, reject) => {
        fetch('https://www.lioren.cl/api/razonesref', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }).then(res => {
            res.json().then(res => {
                resolve(res)
            }).catch(err => {
                reject(err)
            })
        })
    })
    return dte
}



function tipodocs(token) {
    const dte = new Promise((resolve, reject) => {
        fetch('https://www.lioren.cl/api/tipodocs', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }).then(res => {
            res.json().then(res => {
                resolve(res)
            }).catch(err => {
                reject(err)
            })
        })
    })
    return dte
}



export { boleta, miEmpresa, receptor, regiones, comunas, ciudades, factura, razonesRef, tipodocs }