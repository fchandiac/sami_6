import { Grid, TextField, IconButton, Box, Button } from '@mui/material'
import React, {useState, useEffect}  from 'react'
import { Search } from '@mui/icons-material'

const utils = require('../../../utils')


export default function ProviderForm(props) {
    const { dialog, edit, closeDialog, afterSubmit, providerData, setProviderData, gridApiRef } = props
    const [comunasOptions, setComunasOptions] = useState(comunas)
    const [comunasInput, setComunasInput] = useState('')
    const [ciudadesOptions, setCiudadesOptions] = useState(ciudades)
    const [ciudadesInput, setCiudadesInput] = useState('')

    
    return (
        <>
            <Grid container spacing={1} direction={'column'}>
                <Grid item>
                    <Box display="flex" alignItems="center">
                        <TextField
                            fullWidth
                            label="Rut"
                            variant="outlined"
                            value={providerData.rut}
                            onChange={(e) => setProviderData({ ...providerData, rut: utils.formatRut(e.target.value) })}
                            size="small"
                            required
                        />
                        <IconButton onClick={() => { }}>
                            <Search />
                        </IconButton>
                    </Box>
                </Grid>
                <Grid item>
                    <TextField label="Nombre / Razón Social"
                        value={providerData.name}
                        onChange={(e) => { setProviderData({ ...providerData, name: e.target.value }) }}
                        variant="outlined"
                        size={'small'}
                        fullWidth
                        required
                    />
                </Grid>
                <Grid item>
                    <TextField label="Dirección"
                        value={providerData.address}
                        onChange={(e) => { setProviderData({ ...providerData, address: e.target.value }) }}
                        variant="outlined"
                        size={'small'}
                        fullWidth
                        required
                    />
                </Grid>
                <Grid item>
                    <TextField label="Comuna"
                        value={comunasInput}
                        onChange={(e) => { setComunasInput(e.target.value) }}
                        variant="outlined"
                        size={'small'}
                        fullWidth
                        required
                    />
                </Grid>
                <Grid item>
                    <TextField label="Ciudad"
                        value={ciudadesInput}
                        onChange={(e) => { setCiudadesInput(e.target.value) }}
                        variant="outlined"
                        size={'small'}
                        fullWidth
                        required
                    />
                </Grid>
                <Grid item>
                    <TextField label="Teléfono"
                        value={providerData.phone}
                        onChange={(e) => { setProviderData({ ...providerData, phone: e.target.value }) }}
                        variant="outlined"
                        size={'small'}
                        fullWidth
                        required
                    />
                </Grid>
                <Grid item>
                    <Button variant="contained" color="primary" >Guardar</Button>
                </Grid>
            </Grid>
        </>
    )
}



const comunas = [
    {
        "label": "Arica",
        "id": 1,
        "key": 1,
        "region_id": 1
    },
    {
        "label": "Camarones",
        "id": 2,
        "key": 2,
        "region_id": 1
    },
    {
        "label": "Putre",
        "id": 3,
        "key": 3,
        "region_id": 1
    },
    {
        "label": "General Lagos",
        "id": 4,
        "key": 4,
        "region_id": 1
    },
    {
        "label": "Iquique",
        "id": 5,
        "key": 5,
        "region_id": 2
    },
    {
        "label": "Alto Hospicio",
        "id": 6,
        "key": 6,
        "region_id": 2
    },
    {
        "label": "Pozo Almonte",
        "id": 7,
        "key": 7,
        "region_id": 2
    },
    {
        "label": "Camiña",
        "id": 8,
        "key": 8,
        "region_id": 2
    },
    {
        "label": "Colchane",
        "id": 9,
        "key": 9,
        "region_id": 2
    },
    {
        "label": "Huara",
        "id": 10,
        "key": 10,
        "region_id": 2
    },
    {
        "label": "Pica",
        "id": 11,
        "key": 11,
        "region_id": 2
    },
    {
        "label": "Antofagasta",
        "id": 12,
        "key": 12,
        "region_id": 3
    },
    {
        "label": "Mejillones",
        "id": 13,
        "key": 13,
        "region_id": 3
    },
    {
        "label": "Sierra Gorda",
        "id": 14,
        "key": 14,
        "region_id": 3
    },
    {
        "label": "Taltal",
        "id": 15,
        "key": 15,
        "region_id": 3
    },
    {
        "label": "Calama",
        "id": 16,
        "key": 16,
        "region_id": 3
    },
    {
        "label": "Ollagüe",
        "id": 17,
        "key": 17,
        "region_id": 3
    },
    {
        "label": "San Pedro de Atacama",
        "id": 18,
        "key": 18,
        "region_id": 3
    },
    {
        "label": "Tocopilla",
        "id": 19,
        "key": 19,
        "region_id": 3
    },
    {
        "label": "María Elena",
        "id": 20,
        "key": 20,
        "region_id": 3
    },
    {
        "label": "Copiapó",
        "id": 21,
        "key": 21,
        "region_id": 4
    },
    {
        "label": "Caldera",
        "id": 22,
        "key": 22,
        "region_id": 4
    },
    {
        "label": "Tierra Amarilla",
        "id": 23,
        "key": 23,
        "region_id": 4
    },
    {
        "label": "Chañaral",
        "id": 24,
        "key": 24,
        "region_id": 4
    },
    {
        "label": "Diego de Almagro",
        "id": 25,
        "key": 25,
        "region_id": 4
    },
    {
        "label": "Vallenar",
        "id": 26,
        "key": 26,
        "region_id": 4
    },
    {
        "label": "Alto del Carmen",
        "id": 27,
        "key": 27,
        "region_id": 4
    },
    {
        "label": "Freirina",
        "id": 28,
        "key": 28,
        "region_id": 4
    },
    {
        "label": "Huasco",
        "id": 29,
        "key": 29,
        "region_id": 4
    },
    {
        "label": "La Serena",
        "id": 30,
        "key": 30,
        "region_id": 5
    },
    {
        "label": "Coquimbo",
        "id": 31,
        "key": 31,
        "region_id": 5
    },
    {
        "label": "Andacollo",
        "id": 32,
        "key": 32,
        "region_id": 5
    },
    {
        "label": "La Higuera",
        "id": 33,
        "key": 33,
        "region_id": 5
    },
    {
        "label": "Paihuano",
        "id": 34,
        "key": 34,
        "region_id": 5
    },
    {
        "label": "Vicuña",
        "id": 35,
        "key": 35,
        "region_id": 5
    },
    {
        "label": "Illapel",
        "id": 36,
        "key": 36,
        "region_id": 5
    },
    {
        "label": "Canela",
        "id": 37,
        "key": 37,
        "region_id": 5
    },
    {
        "label": "Los Vilos",
        "id": 38,
        "key": 38,
        "region_id": 5
    },
    {
        "label": "Salamanca",
        "id": 39,
        "key": 39,
        "region_id": 5
    },
    {
        "label": "Ovalle",
        "id": 40,
        "key": 40,
        "region_id": 5
    },
    {
        "label": "Combarbalá",
        "id": 41,
        "key": 41,
        "region_id": 5
    },
    {
        "label": "Monte Patria",
        "id": 42,
        "key": 42,
        "region_id": 5
    },
    {
        "label": "Punitaqui",
        "id": 43,
        "key": 43,
        "region_id": 5
    },
    {
        "label": "Río Hurtado",
        "id": 44,
        "key": 44,
        "region_id": 5
    },
    {
        "label": "Valparaíso",
        "id": 45,
        "key": 45,
        "region_id": 6
    },
    {
        "label": "Casablanca",
        "id": 46,
        "key": 46,
        "region_id": 6
    },
    {
        "label": "Concón",
        "id": 47,
        "key": 47,
        "region_id": 6
    },
    {
        "label": "Juan Fernández",
        "id": 48,
        "key": 48,
        "region_id": 6
    },
    {
        "label": "Puchuncaví",
        "id": 49,
        "key": 49,
        "region_id": 6
    },
    {
        "label": "Quintero",
        "id": 50,
        "key": 50,
        "region_id": 6
    },
    {
        "label": "Viña del Mar",
        "id": 51,
        "key": 51,
        "region_id": 6
    },
    {
        "label": "Isla de Pascua",
        "id": 52,
        "key": 52,
        "region_id": 6
    },
    {
        "label": "Los Andes",
        "id": 53,
        "key": 53,
        "region_id": 6
    },
    {
        "label": "Calle Larga",
        "id": 54,
        "key": 54,
        "region_id": 6
    },
    {
        "label": "Rinconada",
        "id": 55,
        "key": 55,
        "region_id": 6
    },
    {
        "label": "San Esteban",
        "id": 56,
        "key": 56,
        "region_id": 6
    },
    {
        "label": "La Ligua",
        "id": 57,
        "key": 57,
        "region_id": 6
    },
    {
        "label": "Cabildo",
        "id": 58,
        "key": 58,
        "region_id": 6
    },
    {
        "label": "Papudo",
        "id": 59,
        "key": 59,
        "region_id": 6
    },
    {
        "label": "Petorca",
        "id": 60,
        "key": 60,
        "region_id": 6
    },
    {
        "label": "Zapallar",
        "id": 61,
        "key": 61,
        "region_id": 6
    },
    {
        "label": "Quillota",
        "id": 62,
        "key": 62,
        "region_id": 6
    },
    {
        "label": "La Calera",
        "id": 63,
        "key": 63,
        "region_id": 6
    },
    {
        "label": "Hijuelas",
        "id": 64,
        "key": 64,
        "region_id": 6
    },
    {
        "label": "La Cruz",
        "id": 65,
        "key": 65,
        "region_id": 6
    },
    {
        "label": "Nogales",
        "id": 66,
        "key": 66,
        "region_id": 6
    },
    {
        "label": "San Antonio",
        "id": 67,
        "key": 67,
        "region_id": 6
    },
    {
        "label": "Algarrobo",
        "id": 68,
        "key": 68,
        "region_id": 6
    },
    {
        "label": "Cartagena",
        "id": 69,
        "key": 69,
        "region_id": 6
    },
    {
        "label": "El Quisco",
        "id": 70,
        "key": 70,
        "region_id": 6
    },
    {
        "label": "El Tabo",
        "id": 71,
        "key": 71,
        "region_id": 6
    },
    {
        "label": "Santo Domingo",
        "id": 72,
        "key": 72,
        "region_id": 6
    },
    {
        "label": "San Felipe",
        "id": 73,
        "key": 73,
        "region_id": 6
    },
    {
        "label": "Catemu",
        "id": 74,
        "key": 74,
        "region_id": 6
    },
    {
        "label": "Llaillay",
        "id": 75,
        "key": 75,
        "region_id": 6
    },
    {
        "label": "Panquehue",
        "id": 76,
        "key": 76,
        "region_id": 6
    },
    {
        "label": "Putaendo",
        "id": 77,
        "key": 77,
        "region_id": 6
    },
    {
        "label": "Santa María",
        "id": 78,
        "key": 78,
        "region_id": 6
    },
    {
        "label": "Quilpué",
        "id": 79,
        "key": 79,
        "region_id": 6
    },
    {
        "label": "Limache",
        "id": 80,
        "key": 80,
        "region_id": 6
    },
    {
        "label": "Olmué",
        "id": 81,
        "key": 81,
        "region_id": 6
    },
    {
        "label": "Villa Alemana",
        "id": 82,
        "key": 82,
        "region_id": 6
    },
    {
        "label": "Rancagua",
        "id": 83,
        "key": 83,
        "region_id": 7
    },
    {
        "label": "Codegua",
        "id": 84,
        "key": 84,
        "region_id": 7
    },
    {
        "label": "Coinco",
        "id": 85,
        "key": 85,
        "region_id": 7
    },
    {
        "label": "Coltauco",
        "id": 86,
        "key": 86,
        "region_id": 7
    },
    {
        "label": "Doñihue",
        "id": 87,
        "key": 87,
        "region_id": 7
    },
    {
        "label": "Graneros",
        "id": 88,
        "key": 88,
        "region_id": 7
    },
    {
        "label": "Las Cabras",
        "id": 89,
        "key": 89,
        "region_id": 7
    },
    {
        "label": "Machalí",
        "id": 90,
        "key": 90,
        "region_id": 7
    },
    {
        "label": "Malloa",
        "id": 91,
        "key": 91,
        "region_id": 7
    },
    {
        "label": "Mostazal",
        "id": 92,
        "key": 92,
        "region_id": 7
    },
    {
        "label": "Olivar",
        "id": 93,
        "key": 93,
        "region_id": 7
    },
    {
        "label": "Peumo",
        "id": 94,
        "key": 94,
        "region_id": 7
    },
    {
        "label": "Pichidegua",
        "id": 95,
        "key": 95,
        "region_id": 7
    },
    {
        "label": "Quinta de Tilcoco",
        "id": 96,
        "key": 96,
        "region_id": 7
    },
    {
        "label": "Rengo",
        "id": 97,
        "key": 97,
        "region_id": 7
    },
    {
        "label": "Requínoa",
        "id": 98,
        "key": 98,
        "region_id": 7
    },
    {
        "label": "San Vicente",
        "id": 99,
        "key": 99,
        "region_id": 7
    },
    {
        "label": "Pichilemu",
        "id": 100,
        "key": 100,
        "region_id": 7
    },
    {
        "label": "La Estrella",
        "id": 101,
        "key": 101,
        "region_id": 7
    },
    {
        "label": "Litueche",
        "id": 102,
        "key": 102,
        "region_id": 7
    },
    {
        "label": "Marchihue",
        "id": 103,
        "key": 103,
        "region_id": 7
    },
    {
        "label": "Navidad",
        "id": 104,
        "key": 104,
        "region_id": 7
    },
    {
        "label": "Paredones",
        "id": 105,
        "key": 105,
        "region_id": 7
    },
    {
        "label": "San Fernando",
        "id": 106,
        "key": 106,
        "region_id": 7
    },
    {
        "label": "Chépica",
        "id": 107,
        "key": 107,
        "region_id": 7
    },
    {
        "label": "Chimbarongo",
        "id": 108,
        "key": 108,
        "region_id": 7
    },
    {
        "label": "Lolol",
        "id": 109,
        "key": 109,
        "region_id": 7
    },
    {
        "label": "Nancagua",
        "id": 110,
        "key": 110,
        "region_id": 7
    },
    {
        "label": "Palmilla",
        "id": 111,
        "key": 111,
        "region_id": 7
    },
    {
        "label": "Peralillo",
        "id": 112,
        "key": 112,
        "region_id": 7
    },
    {
        "label": "Placilla",
        "id": 113,
        "key": 113,
        "region_id": 7
    },
    {
        "label": "Pumanque",
        "id": 114,
        "key": 114,
        "region_id": 7
    },
    {
        "label": "Santa Cruz",
        "id": 115,
        "key": 115,
        "region_id": 7
    },
    {
        "label": "Talca",
        "id": 116,
        "key": 116,
        "region_id": 8
    },
    {
        "label": "Constitución",
        "id": 117,
        "key": 117,
        "region_id": 8
    },
    {
        "label": "Curepto",
        "id": 118,
        "key": 118,
        "region_id": 8
    },
    {
        "label": "Empedrado",
        "id": 119,
        "key": 119,
        "region_id": 8
    },
    {
        "label": "Maule",
        "id": 120,
        "key": 120,
        "region_id": 8
    },
    {
        "label": "Pelarco",
        "id": 121,
        "key": 121,
        "region_id": 8
    },
    {
        "label": "Pencahue",
        "id": 122,
        "key": 122,
        "region_id": 8
    },
    {
        "label": "Río Claro",
        "id": 123,
        "key": 123,
        "region_id": 8
    },
    {
        "label": "San Clemente",
        "id": 124,
        "key": 124,
        "region_id": 8
    },
    {
        "label": "San Rafael",
        "id": 125,
        "key": 125,
        "region_id": 8
    },
    {
        "label": "Cauquenes",
        "id": 126,
        "key": 126,
        "region_id": 8
    },
    {
        "label": "Chanco",
        "id": 127,
        "key": 127,
        "region_id": 8
    },
    {
        "label": "Pelluhue",
        "id": 128,
        "key": 128,
        "region_id": 8
    },
    {
        "label": "Curicó",
        "id": 129,
        "key": 129,
        "region_id": 8
    },
    {
        "label": "Hualañé",
        "id": 130,
        "key": 130,
        "region_id": 8
    },
    {
        "label": "Licantén",
        "id": 131,
        "key": 131,
        "region_id": 8
    },
    {
        "label": "Molina",
        "id": 132,
        "key": 132,
        "region_id": 8
    },
    {
        "label": "Rauco",
        "id": 133,
        "key": 133,
        "region_id": 8
    },
    {
        "label": "Romeral",
        "id": 134,
        "key": 134,
        "region_id": 8
    },
    {
        "label": "Sagrada Familia",
        "id": 135,
        "key": 135,
        "region_id": 8
    },
    {
        "label": "Teno",
        "id": 136,
        "key": 136,
        "region_id": 8
    },
    {
        "label": "Vichuquén",
        "id": 137,
        "key": 137,
        "region_id": 8
    },
    {
        "label": "Linares",
        "id": 138,
        "key": 138,
        "region_id": 8
    },
    {
        "label": "Colbún",
        "id": 139,
        "key": 139,
        "region_id": 8
    },
    {
        "label": "Longaví",
        "id": 140,
        "key": 140,
        "region_id": 8
    },
    {
        "label": "Parral",
        "id": 141,
        "key": 141,
        "region_id": 8
    },
    {
        "label": "Retiro",
        "id": 142,
        "key": 142,
        "region_id": 8
    },
    {
        "label": "San Javier",
        "id": 143,
        "key": 143,
        "region_id": 8
    },
    {
        "label": "Villa Alegre",
        "id": 144,
        "key": 144,
        "region_id": 8
    },
    {
        "label": "Yerbas Buenas",
        "id": 145,
        "key": 145,
        "region_id": 8
    },
    {
        "label": "Concepción",
        "id": 146,
        "key": 146,
        "region_id": 9
    },
    {
        "label": "Coronel",
        "id": 147,
        "key": 147,
        "region_id": 9
    },
    {
        "label": "Chiguayante",
        "id": 148,
        "key": 148,
        "region_id": 9
    },
    {
        "label": "Florida",
        "id": 149,
        "key": 149,
        "region_id": 9
    },
    {
        "label": "Hualqui",
        "id": 150,
        "key": 150,
        "region_id": 9
    },
    {
        "label": "Lota",
        "id": 151,
        "key": 151,
        "region_id": 9
    },
    {
        "label": "Penco",
        "id": 152,
        "key": 152,
        "region_id": 9
    },
    {
        "label": "San Pedro de La Paz",
        "id": 153,
        "key": 153,
        "region_id": 9
    },
    {
        "label": "Santa Juana",
        "id": 154,
        "key": 154,
        "region_id": 9
    },
    {
        "label": "Talcahuano",
        "id": 155,
        "key": 155,
        "region_id": 9
    },
    {
        "label": "Tomé",
        "id": 156,
        "key": 156,
        "region_id": 9
    },
    {
        "label": "Hualpén",
        "id": 157,
        "key": 157,
        "region_id": 9
    },
    {
        "label": "Lebu",
        "id": 158,
        "key": 158,
        "region_id": 9
    },
    {
        "label": "Arauco",
        "id": 159,
        "key": 159,
        "region_id": 9
    },
    {
        "label": "Cañete",
        "id": 160,
        "key": 160,
        "region_id": 9
    },
    {
        "label": "Contulmo",
        "id": 161,
        "key": 161,
        "region_id": 9
    },
    {
        "label": "Curanilahue",
        "id": 162,
        "key": 162,
        "region_id": 9
    },
    {
        "label": "Los Álamos",
        "id": 163,
        "key": 163,
        "region_id": 9
    },
    {
        "label": "Tirúa",
        "id": 164,
        "key": 164,
        "region_id": 9
    },
    {
        "label": "Los Ángeles",
        "id": 165,
        "key": 165,
        "region_id": 9
    },
    {
        "label": "Antuco",
        "id": 166,
        "key": 166,
        "region_id": 9
    },
    {
        "label": "Cabrero",
        "id": 167,
        "key": 167,
        "region_id": 9
    },
    {
        "label": "Laja",
        "id": 168,
        "key": 168,
        "region_id": 9
    },
    {
        "label": "Mulchén",
        "id": 169,
        "key": 169,
        "region_id": 9
    },
    {
        "label": "Nacimiento",
        "id": 170,
        "key": 170,
        "region_id": 9
    },
    {
        "label": "Negrete",
        "id": 171,
        "key": 171,
        "region_id": 9
    },
    {
        "label": "Quilaco",
        "id": 172,
        "key": 172,
        "region_id": 9
    },
    {
        "label": "Quilleco",
        "id": 173,
        "key": 173,
        "region_id": 9
    },
    {
        "label": "San Rosendo",
        "id": 174,
        "key": 174,
        "region_id": 9
    },
    {
        "label": "Santa Bárbara",
        "id": 175,
        "key": 175,
        "region_id": 9
    },
    {
        "label": "Tucapel",
        "id": 176,
        "key": 176,
        "region_id": 9
    },
    {
        "label": "Yumbel",
        "id": 177,
        "key": 177,
        "region_id": 9
    },
    {
        "label": "Alto Biobío",
        "id": 178,
        "key": 178,
        "region_id": 9
    },
    {
        "label": "Temuco",
        "id": 200,
        "key": 200,
        "region_id": 10
    },
    {
        "label": "Carahue",
        "id": 201,
        "key": 201,
        "region_id": 10
    },
    {
        "label": "Cunco",
        "id": 202,
        "key": 202,
        "region_id": 10
    },
    {
        "label": "Curarrehue",
        "id": 203,
        "key": 203,
        "region_id": 10
    },
    {
        "label": "Freire",
        "id": 204,
        "key": 204,
        "region_id": 10
    },
    {
        "label": "Galvarino",
        "id": 205,
        "key": 205,
        "region_id": 10
    },
    {
        "label": "Gorbea",
        "id": 206,
        "key": 206,
        "region_id": 10
    },
    {
        "label": "Lautaro",
        "id": 207,
        "key": 207,
        "region_id": 10
    },
    {
        "label": "Loncoche",
        "id": 208,
        "key": 208,
        "region_id": 10
    },
    {
        "label": "Melipeuco",
        "id": 209,
        "key": 209,
        "region_id": 10
    },
    {
        "label": "Nueva Imperial",
        "id": 210,
        "key": 210,
        "region_id": 10
    },
    {
        "label": "Padre Las Casas",
        "id": 211,
        "key": 211,
        "region_id": 10
    },
    {
        "label": "Perquenco",
        "id": 212,
        "key": 212,
        "region_id": 10
    },
    {
        "label": "Pitrufquén",
        "id": 213,
        "key": 213,
        "region_id": 10
    },
    {
        "label": "Pucón",
        "id": 214,
        "key": 214,
        "region_id": 10
    },
    {
        "label": "Saavedra",
        "id": 215,
        "key": 215,
        "region_id": 10
    },
    {
        "label": "Teodoro Schmidt",
        "id": 216,
        "key": 216,
        "region_id": 10
    },
    {
        "label": "Toltén",
        "id": 217,
        "key": 217,
        "region_id": 10
    },
    {
        "label": "Vilcún",
        "id": 218,
        "key": 218,
        "region_id": 10
    },
    {
        "label": "Villarrica",
        "id": 219,
        "key": 219,
        "region_id": 10
    },
    {
        "label": "Cholchol",
        "id": 220,
        "key": 220,
        "region_id": 10
    },
    {
        "label": "Angol",
        "id": 221,
        "key": 221,
        "region_id": 10
    },
    {
        "label": "Collipulli",
        "id": 222,
        "key": 222,
        "region_id": 10
    },
    {
        "label": "Curacautín",
        "id": 223,
        "key": 223,
        "region_id": 10
    },
    {
        "label": "Ercilla",
        "id": 224,
        "key": 224,
        "region_id": 10
    },
    {
        "label": "Lonquimay",
        "id": 225,
        "key": 225,
        "region_id": 10
    },
    {
        "label": "Los Sauces",
        "id": 226,
        "key": 226,
        "region_id": 10
    },
    {
        "label": "Lumaco",
        "id": 227,
        "key": 227,
        "region_id": 10
    },
    {
        "label": "Purén",
        "id": 228,
        "key": 228,
        "region_id": 10
    },
    {
        "label": "Renaico",
        "id": 229,
        "key": 229,
        "region_id": 10
    },
    {
        "label": "Traiguén",
        "id": 230,
        "key": 230,
        "region_id": 10
    },
    {
        "label": "Victoria",
        "id": 231,
        "key": 231,
        "region_id": 10
    },
    {
        "label": "Valdivia",
        "id": 232,
        "key": 232,
        "region_id": 11
    },
    {
        "label": "Corral",
        "id": 233,
        "key": 233,
        "region_id": 11
    },
    {
        "label": "Lanco",
        "id": 234,
        "key": 234,
        "region_id": 11
    },
    {
        "label": "Los Lagos",
        "id": 235,
        "key": 235,
        "region_id": 11
    },
    {
        "label": "Máfil",
        "id": 236,
        "key": 236,
        "region_id": 11
    },
    {
        "label": "Mariquina",
        "id": 237,
        "key": 237,
        "region_id": 11
    },
    {
        "label": "Paillaco",
        "id": 238,
        "key": 238,
        "region_id": 11
    },
    {
        "label": "Panguipulli",
        "id": 239,
        "key": 239,
        "region_id": 11
    },
    {
        "label": "La Unión",
        "id": 240,
        "key": 240,
        "region_id": 11
    },
    {
        "label": "Futrono",
        "id": 241,
        "key": 241,
        "region_id": 11
    },
    {
        "label": "Lago Ranco",
        "id": 242,
        "key": 242,
        "region_id": 11
    },
    {
        "label": "Río Bueno",
        "id": 243,
        "key": 243,
        "region_id": 11
    },
    {
        "label": "Puerto Montt",
        "id": 244,
        "key": 244,
        "region_id": 12
    },
    {
        "label": "Calbuco",
        "id": 245,
        "key": 245,
        "region_id": 12
    },
    {
        "label": "Cochamó",
        "id": 246,
        "key": 246,
        "region_id": 12
    },
    {
        "label": "Fresia",
        "id": 247,
        "key": 247,
        "region_id": 12
    },
    {
        "label": "Frutillar",
        "id": 248,
        "key": 248,
        "region_id": 12
    },
    {
        "label": "Los Muermos",
        "id": 249,
        "key": 249,
        "region_id": 12
    },
    {
        "label": "Llanquihue",
        "id": 250,
        "key": 250,
        "region_id": 12
    },
    {
        "label": "Maullín",
        "id": 251,
        "key": 251,
        "region_id": 12
    },
    {
        "label": "Puerto Varas",
        "id": 252,
        "key": 252,
        "region_id": 12
    },
    {
        "label": "Castro",
        "id": 253,
        "key": 253,
        "region_id": 12
    },
    {
        "label": "Ancud",
        "id": 254,
        "key": 254,
        "region_id": 12
    },
    {
        "label": "Chonchi",
        "id": 255,
        "key": 255,
        "region_id": 12
    },
    {
        "label": "Curaco de Vélez",
        "id": 256,
        "key": 256,
        "region_id": 12
    },
    {
        "label": "Dalcahue",
        "id": 257,
        "key": 257,
        "region_id": 12
    },
    {
        "label": "Puqueldón",
        "id": 258,
        "key": 258,
        "region_id": 12
    },
    {
        "label": "Queilén",
        "id": 259,
        "key": 259,
        "region_id": 12
    },
    {
        "label": "Quellón",
        "id": 260,
        "key": 260,
        "region_id": 12
    },
    {
        "label": "Quemchi",
        "id": 261,
        "key": 261,
        "region_id": 12
    },
    {
        "label": "Quinchao",
        "id": 262,
        "key": 262,
        "region_id": 12
    },
    {
        "label": "Osorno",
        "id": 263,
        "key": 263,
        "region_id": 12
    },
    {
        "label": "Puerto Octay",
        "id": 264,
        "key": 264,
        "region_id": 12
    },
    {
        "label": "Purranque",
        "id": 265,
        "key": 265,
        "region_id": 12
    },
    {
        "label": "Puyehue",
        "id": 266,
        "key": 266,
        "region_id": 12
    },
    {
        "label": "Río Negro",
        "id": 267,
        "key": 267,
        "region_id": 12
    },
    {
        "label": "San Juan de la Costa",
        "id": 268,
        "key": 268,
        "region_id": 12
    },
    {
        "label": "San Pablo",
        "id": 269,
        "key": 269,
        "region_id": 12
    },
    {
        "label": "Chaitén",
        "id": 270,
        "key": 270,
        "region_id": 12
    },
    {
        "label": "Futaleufú",
        "id": 271,
        "key": 271,
        "region_id": 12
    },
    {
        "label": "Hualaihué",
        "id": 272,
        "key": 272,
        "region_id": 12
    },
    {
        "label": "Palena",
        "id": 273,
        "key": 273,
        "region_id": 12
    },
    {
        "label": "Coyhaique",
        "id": 274,
        "key": 274,
        "region_id": 13
    },
    {
        "label": "Lago Verde",
        "id": 275,
        "key": 275,
        "region_id": 13
    },
    {
        "label": "Aysén",
        "id": 276,
        "key": 276,
        "region_id": 13
    },
    {
        "label": "Cisnes",
        "id": 277,
        "key": 277,
        "region_id": 13
    },
    {
        "label": "Guaitecas",
        "id": 278,
        "key": 278,
        "region_id": 13
    },
    {
        "label": "Cochrane",
        "id": 279,
        "key": 279,
        "region_id": 13
    },
    {
        "label": "O'Higgins",
        "id": 280,
        "key": 280,
        "region_id": 13
    },
    {
        "label": "Tortel",
        "id": 281,
        "key": 281,
        "region_id": 13
    },
    {
        "label": "Chile Chico",
        "id": 282,
        "key": 282,
        "region_id": 13
    },
    {
        "label": "Río Ibáñez",
        "id": 283,
        "key": 283,
        "region_id": 13
    },
    {
        "label": "Punta Arenas",
        "id": 284,
        "key": 284,
        "region_id": 14
    },
    {
        "label": "Laguna Blanca",
        "id": 285,
        "key": 285,
        "region_id": 14
    },
    {
        "label": "Río Verde",
        "id": 286,
        "key": 286,
        "region_id": 14
    },
    {
        "label": "San Gregorio",
        "id": 287,
        "key": 287,
        "region_id": 14
    },
    {
        "label": "Cabo de Hornos",
        "id": 288,
        "key": 288,
        "region_id": 14
    },
    {
        "label": "Antártica",
        "id": 289,
        "key": 289,
        "region_id": 14
    },
    {
        "label": "Porvenir",
        "id": 290,
        "key": 290,
        "region_id": 14
    },
    {
        "label": "Primavera",
        "id": 291,
        "key": 291,
        "region_id": 14
    },
    {
        "label": "Timaukel",
        "id": 292,
        "key": 292,
        "region_id": 14
    },
    {
        "label": "Natales",
        "id": 293,
        "key": 293,
        "region_id": 14
    },
    {
        "label": "Torres del Paine",
        "id": 294,
        "key": 294,
        "region_id": 14
    },
    {
        "label": "Santiago",
        "id": 295,
        "key": 295,
        "region_id": 15
    },
    {
        "label": "Cerrillos",
        "id": 296,
        "key": 296,
        "region_id": 15
    },
    {
        "label": "Cerro Navia",
        "id": 297,
        "key": 297,
        "region_id": 15
    },
    {
        "label": "Conchalí",
        "id": 298,
        "key": 298,
        "region_id": 15
    },
    {
        "label": "El Bosque",
        "id": 299,
        "key": 299,
        "region_id": 15
    },
    {
        "label": "Estación Central",
        "id": 300,
        "key": 300,
        "region_id": 15
    },
    {
        "label": "Huechuraba",
        "id": 301,
        "key": 301,
        "region_id": 15
    },
    {
        "label": "Independencia",
        "id": 302,
        "key": 302,
        "region_id": 15
    },
    {
        "label": "La Cisterna",
        "id": 303,
        "key": 303,
        "region_id": 15
    },
    {
        "label": "La Florida",
        "id": 304,
        "key": 304,
        "region_id": 15
    },
    {
        "label": "La Granja",
        "id": 305,
        "key": 305,
        "region_id": 15
    },
    {
        "label": "La Pintana",
        "id": 306,
        "key": 306,
        "region_id": 15
    },
    {
        "label": "La Reina",
        "id": 307,
        "key": 307,
        "region_id": 15
    },
    {
        "label": "Las Condes",
        "id": 308,
        "key": 308,
        "region_id": 15
    },
    {
        "label": "Lo Barnechea",
        "id": 309,
        "key": 309,
        "region_id": 15
    },
    {
        "label": "Lo Espejo",
        "id": 310,
        "key": 310,
        "region_id": 15
    },
    {
        "label": "Lo Prado",
        "id": 311,
        "key": 311,
        "region_id": 15
    },
    {
        "label": "Macul",
        "id": 312,
        "key": 312,
        "region_id": 15
    },
    {
        "label": "Maipú",
        "id": 313,
        "key": 313,
        "region_id": 15
    },
    {
        "label": "Ñuñoa",
        "id": 314,
        "key": 314,
        "region_id": 15
    },
    {
        "label": "Pedro Aguirre Cerda",
        "id": 315,
        "key": 315,
        "region_id": 15
    },
    {
        "label": "Peñalolén",
        "id": 316,
        "key": 316,
        "region_id": 15
    },
    {
        "label": "Providencia",
        "id": 317,
        "key": 317,
        "region_id": 15
    },
    {
        "label": "Pudahuel",
        "id": 318,
        "key": 318,
        "region_id": 15
    },
    {
        "label": "Quilicura",
        "id": 319,
        "key": 319,
        "region_id": 15
    },
    {
        "label": "Quinta Normal",
        "id": 320,
        "key": 320,
        "region_id": 15
    },
    {
        "label": "Recoleta",
        "id": 321,
        "key": 321,
        "region_id": 15
    },
    {
        "label": "Renca",
        "id": 322,
        "key": 322,
        "region_id": 15
    },
    {
        "label": "San Joaquín",
        "id": 323,
        "key": 323,
        "region_id": 15
    },
    {
        "label": "San Miguel",
        "id": 324,
        "key": 324,
        "region_id": 15
    },
    {
        "label": "San Ramón",
        "id": 325,
        "key": 325,
        "region_id": 15
    },
    {
        "label": "Vitacura",
        "id": 326,
        "key": 326,
        "region_id": 15
    },
    {
        "label": "Puente Alto",
        "id": 327,
        "key": 327,
        "region_id": 15
    },
    {
        "label": "Pirque",
        "id": 328,
        "key": 328,
        "region_id": 15
    },
    {
        "label": "San José de Maipo",
        "id": 329,
        "key": 329,
        "region_id": 15
    },
    {
        "label": "Colina",
        "id": 330,
        "key": 330,
        "region_id": 15
    },
    {
        "label": "Lampa",
        "id": 331,
        "key": 331,
        "region_id": 15
    },
    {
        "label": "Til Til",
        "id": 332,
        "key": 332,
        "region_id": 15
    },
    {
        "label": "San Bernardo",
        "id": 333,
        "key": 333,
        "region_id": 15
    },
    {
        "label": "Buin",
        "id": 334,
        "key": 334,
        "region_id": 15
    },
    {
        "label": "Calera de Tango",
        "id": 335,
        "key": 335,
        "region_id": 15
    },
    {
        "label": "Paine",
        "id": 336,
        "key": 336,
        "region_id": 15
    },
    {
        "label": "Melipilla",
        "id": 337,
        "key": 337,
        "region_id": 15
    },
    {
        "label": "Alhué",
        "id": 338,
        "key": 338,
        "region_id": 15
    },
    {
        "label": "Curacaví",
        "id": 339,
        "key": 339,
        "region_id": 15
    },
    {
        "label": "María Pinto",
        "id": 340,
        "key": 340,
        "region_id": 15
    },
    {
        "label": "San Pedro",
        "id": 341,
        "key": 341,
        "region_id": 15
    },
    {
        "label": "Talagante",
        "id": 342,
        "key": 342,
        "region_id": 15
    },
    {
        "label": "El Monte",
        "id": 343,
        "key": 343,
        "region_id": 15
    },
    {
        "label": "Isla de Maipo",
        "id": 344,
        "key": 344,
        "region_id": 15
    },
    {
        "label": "Padre Hurtado",
        "id": 345,
        "key": 345,
        "region_id": 15
    },
    {
        "label": "Peñaflor",
        "id": 346,
        "key": 346,
        "region_id": 15
    },
    {
        "label": "Chillán",
        "id": 179,
        "key": 179,
        "region_id": 27
    },
    {
        "label": "Bulnes",
        "id": 180,
        "key": 180,
        "region_id": 27
    },
    {
        "label": "Chillán Viejo",
        "id": 184,
        "key": 184,
        "region_id": 27
    },
    {
        "label": "El Carmen",
        "id": 185,
        "key": 185,
        "region_id": 27
    },
    {
        "label": "Pemuco",
        "id": 188,
        "key": 188,
        "region_id": 27
    },
    {
        "label": "Pinto",
        "id": 189,
        "key": 189,
        "region_id": 27
    },
    {
        "label": "Quillón",
        "id": 191,
        "key": 191,
        "region_id": 27
    },
    {
        "label": "San Ignacio",
        "id": 196,
        "key": 196,
        "region_id": 27
    },
    {
        "label": "Yungay",
        "id": 199,
        "key": 199,
        "region_id": 27
    },
    {
        "label": "Cobquecura",
        "id": 181,
        "key": 181,
        "region_id": 27
    },
    {
        "label": "Coelemu",
        "id": 182,
        "key": 182,
        "region_id": 27
    },
    {
        "label": "Ninhue",
        "id": 186,
        "key": 186,
        "region_id": 27
    },
    {
        "label": "Portezuelo",
        "id": 190,
        "key": 190,
        "region_id": 27
    },
    {
        "label": "Quirihue",
        "id": 192,
        "key": 192,
        "region_id": 27
    },
    {
        "label": "Ránquil",
        "id": 193,
        "key": 193,
        "region_id": 27
    },
    {
        "label": "Treguaco",
        "id": 198,
        "key": 198,
        "region_id": 27
    },
    {
        "label": "Coihueco",
        "id": 183,
        "key": 183,
        "region_id": 27
    },
    {
        "label": "Ñiquén",
        "id": 187,
        "key": 187,
        "region_id": 27
    },
    {
        "label": "San Carlos",
        "id": 194,
        "key": 194,
        "region_id": 27
    },
    {
        "label": "San Fabián",
        "id": 195,
        "key": 195,
        "region_id": 27
    },
    {
        "label": "San Nicolás",
        "id": 197,
        "key": 197,
        "region_id": 27
    }
]

const ciudades = [
    {
        "label": "Arica",
        "id": 1,
        "key": 1,
        "region_id": 1
    },
    {
        "label": "Iquique",
        "id": 2,
        "key": 2,
        "region_id": 2
    },
    {
        "label": "Alto Hospicio",
        "id": 3,
        "key": 3,
        "region_id": 2
    },
    {
        "label": "Pozo Almonte",
        "id": 4,
        "key": 4,
        "region_id": 2
    },
    {
        "label": "Antofagasta",
        "id": 5,
        "key": 5,
        "region_id": 3
    },
    {
        "label": "Calama",
        "id": 6,
        "key": 6,
        "region_id": 3
    },
    {
        "label": "Tocopilla",
        "id": 7,
        "key": 7,
        "region_id": 3
    },
    {
        "label": "Taltal",
        "id": 8,
        "key": 8,
        "region_id": 3
    },
    {
        "label": "Mejillones",
        "id": 9,
        "key": 9,
        "region_id": 3
    },
    {
        "label": "María Elena",
        "id": 10,
        "key": 10,
        "region_id": 3
    },
    {
        "label": "Copiapó",
        "id": 11,
        "key": 11,
        "region_id": 4
    },
    {
        "label": "Caldera",
        "id": 12,
        "key": 12,
        "region_id": 4
    },
    {
        "label": "Tierra Amarilla",
        "id": 13,
        "key": 13,
        "region_id": 4
    },
    {
        "label": "Chañaral",
        "id": 14,
        "key": 14,
        "region_id": 4
    },
    {
        "label": "Diego de Almagro",
        "id": 15,
        "key": 15,
        "region_id": 4
    },
    {
        "label": "El Salvador",
        "id": 16,
        "key": 16,
        "region_id": 4
    },
    {
        "label": "Vallenar",
        "id": 17,
        "key": 17,
        "region_id": 4
    },
    {
        "label": "Huasco",
        "id": 18,
        "key": 18,
        "region_id": 4
    },
    {
        "label": "La Serena",
        "id": 19,
        "key": 19,
        "region_id": 5
    },
    {
        "label": "Coquimbo",
        "id": 20,
        "key": 20,
        "region_id": 5
    },
    {
        "label": "Andacollo",
        "id": 21,
        "key": 21,
        "region_id": 5
    },
    {
        "label": "Vicuña",
        "id": 22,
        "key": 22,
        "region_id": 5
    },
    {
        "label": "Illapel",
        "id": 23,
        "key": 23,
        "region_id": 5
    },
    {
        "label": "Los Vilos",
        "id": 24,
        "key": 24,
        "region_id": 5
    },
    {
        "label": "Salamanca",
        "id": 25,
        "key": 25,
        "region_id": 5
    },
    {
        "label": "Ovalle",
        "id": 26,
        "key": 26,
        "region_id": 5
    },
    {
        "label": "Combarbalá",
        "id": 27,
        "key": 27,
        "region_id": 5
    },
    {
        "label": "Monte Patria",
        "id": 28,
        "key": 28,
        "region_id": 5
    },
    {
        "label": "Valparaíso",
        "id": 29,
        "key": 29,
        "region_id": 6
    },
    {
        "label": "Concón",
        "id": 30,
        "key": 30,
        "region_id": 6
    },
    {
        "label": "Viña del Mar",
        "id": 31,
        "key": 31,
        "region_id": 6
    },
    {
        "label": "Villa Alemana",
        "id": 32,
        "key": 32,
        "region_id": 6
    },
    {
        "label": "Quilpué",
        "id": 33,
        "key": 33,
        "region_id": 6
    },
    {
        "label": "Placilla de Peñuelas",
        "id": 34,
        "key": 34,
        "region_id": 6
    },
    {
        "label": "San Antonio",
        "id": 35,
        "key": 35,
        "region_id": 6
    },
    {
        "label": "Santo Domingo",
        "id": 36,
        "key": 36,
        "region_id": 6
    },
    {
        "label": "Cartagena",
        "id": 37,
        "key": 37,
        "region_id": 6
    },
    {
        "label": "Quillota",
        "id": 38,
        "key": 38,
        "region_id": 6
    },
    {
        "label": "Hijuelas",
        "id": 39,
        "key": 39,
        "region_id": 6
    },
    {
        "label": "La Calera",
        "id": 40,
        "key": 40,
        "region_id": 6
    },
    {
        "label": "La Cruz",
        "id": 41,
        "key": 41,
        "region_id": 6
    },
    {
        "label": "San Felipe",
        "id": 42,
        "key": 42,
        "region_id": 6
    },
    {
        "label": "Casablanca",
        "id": 43,
        "key": 43,
        "region_id": 6
    },
    {
        "label": "Las Ventanas",
        "id": 44,
        "key": 44,
        "region_id": 6
    },
    {
        "label": "Quintero",
        "id": 45,
        "key": 45,
        "region_id": 6
    },
    {
        "label": "Los Andes",
        "id": 46,
        "key": 46,
        "region_id": 6
    },
    {
        "label": "Calle Larga",
        "id": 47,
        "key": 47,
        "region_id": 6
    },
    {
        "label": "Rinconada",
        "id": 48,
        "key": 48,
        "region_id": 6
    },
    {
        "label": "San Esteban",
        "id": 49,
        "key": 49,
        "region_id": 6
    },
    {
        "label": "La Ligua",
        "id": 50,
        "key": 50,
        "region_id": 6
    },
    {
        "label": "Cabildo",
        "id": 51,
        "key": 51,
        "region_id": 6
    },
    {
        "label": "Limache",
        "id": 52,
        "key": 52,
        "region_id": 6
    },
    {
        "label": "Nogales",
        "id": 53,
        "key": 53,
        "region_id": 6
    },
    {
        "label": "El Melón",
        "id": 54,
        "key": 54,
        "region_id": 6
    },
    {
        "label": "Olmué",
        "id": 55,
        "key": 55,
        "region_id": 6
    },
    {
        "label": "Algarrobo",
        "id": 56,
        "key": 56,
        "region_id": 6
    },
    {
        "label": "El Quisco",
        "id": 57,
        "key": 57,
        "region_id": 6
    },
    {
        "label": "El Tabo",
        "id": 58,
        "key": 58,
        "region_id": 6
    },
    {
        "label": "Catemu",
        "id": 59,
        "key": 59,
        "region_id": 6
    },
    {
        "label": "Llaillay",
        "id": 60,
        "key": 60,
        "region_id": 6
    },
    {
        "label": "Putaendo",
        "id": 61,
        "key": 61,
        "region_id": 6
    },
    {
        "label": "Santa María",
        "id": 62,
        "key": 62,
        "region_id": 6
    },
    {
        "label": "Papudo",
        "id": 213,
        "key": 213,
        "region_id": 6
    },
    {
        "label": "Rancagua",
        "id": 63,
        "key": 63,
        "region_id": 7
    },
    {
        "label": "Machalí",
        "id": 64,
        "key": 64,
        "region_id": 7
    },
    {
        "label": "Gultro",
        "id": 65,
        "key": 65,
        "region_id": 7
    },
    {
        "label": "Codegua",
        "id": 66,
        "key": 66,
        "region_id": 7
    },
    {
        "label": "Doñihue",
        "id": 67,
        "key": 67,
        "region_id": 7
    },
    {
        "label": "Lo Miranda",
        "id": 68,
        "key": 68,
        "region_id": 7
    },
    {
        "label": "Graneros",
        "id": 69,
        "key": 69,
        "region_id": 7
    },
    {
        "label": "Las Cabras",
        "id": 70,
        "key": 70,
        "region_id": 7
    },
    {
        "label": "San Francisco de Mostazal",
        "id": 71,
        "key": 71,
        "region_id": 7
    },
    {
        "label": "Peumo",
        "id": 72,
        "key": 72,
        "region_id": 7
    },
    {
        "label": "Quinta de Tilcoco",
        "id": 73,
        "key": 73,
        "region_id": 7
    },
    {
        "label": "Rengo",
        "id": 74,
        "key": 74,
        "region_id": 7
    },
    {
        "label": "Requínoa",
        "id": 75,
        "key": 75,
        "region_id": 7
    },
    {
        "label": "San Vicente de Tagua Tagua",
        "id": 76,
        "key": 76,
        "region_id": 7
    },
    {
        "label": "Pichilemu",
        "id": 77,
        "key": 77,
        "region_id": 7
    },
    {
        "label": "San Fernando",
        "id": 78,
        "key": 78,
        "region_id": 7
    },
    {
        "label": "Chimbarongo",
        "id": 79,
        "key": 79,
        "region_id": 7
    },
    {
        "label": "Nancagua",
        "id": 80,
        "key": 80,
        "region_id": 7
    },
    {
        "label": "Palmilla",
        "id": 81,
        "key": 81,
        "region_id": 7
    },
    {
        "label": "Santa Cruz",
        "id": 82,
        "key": 82,
        "region_id": 7
    },
    {
        "label": "Talca",
        "id": 83,
        "key": 83,
        "region_id": 8
    },
    {
        "label": "Curicó",
        "id": 84,
        "key": 84,
        "region_id": 8
    },
    {
        "label": "Linares",
        "id": 85,
        "key": 85,
        "region_id": 8
    },
    {
        "label": "Constitución",
        "id": 86,
        "key": 86,
        "region_id": 8
    },
    {
        "label": "San Clemente",
        "id": 87,
        "key": 87,
        "region_id": 8
    },
    {
        "label": "Cauquenes",
        "id": 88,
        "key": 88,
        "region_id": 8
    },
    {
        "label": "Hualañé",
        "id": 89,
        "key": 89,
        "region_id": 8
    },
    {
        "label": "Molina",
        "id": 90,
        "key": 90,
        "region_id": 8
    },
    {
        "label": "Teno",
        "id": 91,
        "key": 91,
        "region_id": 8
    },
    {
        "label": "Longaví",
        "id": 92,
        "key": 92,
        "region_id": 8
    },
    {
        "label": "Parral",
        "id": 93,
        "key": 93,
        "region_id": 8
    },
    {
        "label": "San Javier",
        "id": 94,
        "key": 94,
        "region_id": 8
    },
    {
        "label": "Villa Alegre",
        "id": 95,
        "key": 95,
        "region_id": 8
    },
    {
        "label": "Concepción",
        "id": 96,
        "key": 96,
        "region_id": 9
    },
    {
        "label": "Talcahuano",
        "id": 97,
        "key": 97,
        "region_id": 9
    },
    {
        "label": "Chiguayante",
        "id": 98,
        "key": 98,
        "region_id": 9
    },
    {
        "label": "Coronel",
        "id": 99,
        "key": 99,
        "region_id": 9
    },
    {
        "label": "Hualqui",
        "id": 100,
        "key": 100,
        "region_id": 9
    },
    {
        "label": "Lota",
        "id": 101,
        "key": 101,
        "region_id": 9
    },
    {
        "label": "Penco",
        "id": 102,
        "key": 102,
        "region_id": 9
    },
    {
        "label": "Tomé",
        "id": 103,
        "key": 103,
        "region_id": 9
    },
    {
        "label": "Hualpén",
        "id": 104,
        "key": 104,
        "region_id": 9
    },
    {
        "label": "San Pedro de la Paz",
        "id": 105,
        "key": 105,
        "region_id": 9
    },
    {
        "label": "Los Ángeles",
        "id": 108,
        "key": 108,
        "region_id": 9
    },
    {
        "label": "Santa Juana",
        "id": 109,
        "key": 109,
        "region_id": 9
    },
    {
        "label": "Lebu",
        "id": 110,
        "key": 110,
        "region_id": 9
    },
    {
        "label": "Arauco",
        "id": 111,
        "key": 111,
        "region_id": 9
    },
    {
        "label": "Cañete",
        "id": 112,
        "key": 112,
        "region_id": 9
    },
    {
        "label": "Curanilahue",
        "id": 113,
        "key": 113,
        "region_id": 9
    },
    {
        "label": "Los Álamos",
        "id": 114,
        "key": 114,
        "region_id": 9
    },
    {
        "label": "Cabrero",
        "id": 115,
        "key": 115,
        "region_id": 9
    },
    {
        "label": "Monte Águila",
        "id": 116,
        "key": 116,
        "region_id": 9
    },
    {
        "label": "Conurbación La Laja-San Rosendo",
        "id": 117,
        "key": 117,
        "region_id": 9
    },
    {
        "label": "Mulchén",
        "id": 118,
        "key": 118,
        "region_id": 9
    },
    {
        "label": "Nacimiento",
        "id": 119,
        "key": 119,
        "region_id": 9
    },
    {
        "label": "Santa Bárbara",
        "id": 120,
        "key": 120,
        "region_id": 9
    },
    {
        "label": "Huépil",
        "id": 121,
        "key": 121,
        "region_id": 9
    },
    {
        "label": "Yumbel",
        "id": 122,
        "key": 122,
        "region_id": 9
    },
    {
        "label": "Pemuco",
        "id": 199,
        "key": 199,
        "region_id": 9
    },
    {
        "label": "Temuco",
        "id": 130,
        "key": 130,
        "region_id": 10
    },
    {
        "label": "Padre Las Casas",
        "id": 131,
        "key": 131,
        "region_id": 10
    },
    {
        "label": "Labranza",
        "id": 132,
        "key": 132,
        "region_id": 10
    },
    {
        "label": "Carahue",
        "id": 133,
        "key": 133,
        "region_id": 10
    },
    {
        "label": "Cunco",
        "id": 134,
        "key": 134,
        "region_id": 10
    },
    {
        "label": "Freire",
        "id": 135,
        "key": 135,
        "region_id": 10
    },
    {
        "label": "Gorbea",
        "id": 136,
        "key": 136,
        "region_id": 10
    },
    {
        "label": "Lautaro",
        "id": 137,
        "key": 137,
        "region_id": 10
    },
    {
        "label": "Loncoche",
        "id": 138,
        "key": 138,
        "region_id": 10
    },
    {
        "label": "Nueva Imperial",
        "id": 139,
        "key": 139,
        "region_id": 10
    },
    {
        "label": "Pitrufquén",
        "id": 140,
        "key": 140,
        "region_id": 10
    },
    {
        "label": "Pucón",
        "id": 141,
        "key": 141,
        "region_id": 10
    },
    {
        "label": "Villarrica",
        "id": 142,
        "key": 142,
        "region_id": 10
    },
    {
        "label": "Angol",
        "id": 143,
        "key": 143,
        "region_id": 10
    },
    {
        "label": "Collipulli",
        "id": 144,
        "key": 144,
        "region_id": 10
    },
    {
        "label": "Curacautín",
        "id": 145,
        "key": 145,
        "region_id": 10
    },
    {
        "label": "Purén",
        "id": 146,
        "key": 146,
        "region_id": 10
    },
    {
        "label": "Renaico",
        "id": 147,
        "key": 147,
        "region_id": 10
    },
    {
        "label": "Traiguén",
        "id": 148,
        "key": 148,
        "region_id": 10
    },
    {
        "label": "Victoria",
        "id": 149,
        "key": 149,
        "region_id": 10
    },
    {
        "label": "Vilcún",
        "id": 243,
        "key": 243,
        "region_id": 10
    },
    {
        "label": "Capitán Pastene",
        "id": 244,
        "key": 244,
        "region_id": 10
    },
    {
        "label": "Ercilla",
        "id": 255,
        "key": 255,
        "region_id": 10
    },
    {
        "label": "Valdivia",
        "id": 150,
        "key": 150,
        "region_id": 11
    },
    {
        "label": "Futrono",
        "id": 151,
        "key": 151,
        "region_id": 11
    },
    {
        "label": "La Unión",
        "id": 152,
        "key": 152,
        "region_id": 11
    },
    {
        "label": "Lanco",
        "id": 153,
        "key": 153,
        "region_id": 11
    },
    {
        "label": "Los Lagos",
        "id": 154,
        "key": 154,
        "region_id": 11
    },
    {
        "label": "San José de la Mariquina",
        "id": 155,
        "key": 155,
        "region_id": 11
    },
    {
        "label": "Paillaco",
        "id": 156,
        "key": 156,
        "region_id": 11
    },
    {
        "label": "Panguipulli",
        "id": 157,
        "key": 157,
        "region_id": 11
    },
    {
        "label": "Río Bueno",
        "id": 158,
        "key": 158,
        "region_id": 11
    },
    {
        "label": "Puerto Montt",
        "id": 159,
        "key": 159,
        "region_id": 12
    },
    {
        "label": "Puerto Varas",
        "id": 160,
        "key": 160,
        "region_id": 12
    },
    {
        "label": "Calbuco",
        "id": 161,
        "key": 161,
        "region_id": 12
    },
    {
        "label": "Fresia",
        "id": 162,
        "key": 162,
        "region_id": 12
    },
    {
        "label": "Frutillar",
        "id": 163,
        "key": 163,
        "region_id": 12
    },
    {
        "label": "Los Muermos",
        "id": 164,
        "key": 164,
        "region_id": 12
    },
    {
        "label": "Llanquihue",
        "id": 165,
        "key": 165,
        "region_id": 12
    },
    {
        "label": "Castro",
        "id": 166,
        "key": 166,
        "region_id": 12
    },
    {
        "label": "Ancud",
        "id": 167,
        "key": 167,
        "region_id": 12
    },
    {
        "label": "Quellón",
        "id": 168,
        "key": 168,
        "region_id": 12
    },
    {
        "label": "Osorno",
        "id": 169,
        "key": 169,
        "region_id": 12
    },
    {
        "label": "Purranque",
        "id": 170,
        "key": 170,
        "region_id": 12
    },
    {
        "label": "Río Negro",
        "id": 171,
        "key": 171,
        "region_id": 12
    },
    {
        "label": "Chaitén",
        "id": 214,
        "key": 214,
        "region_id": 12
    },
    {
        "label": "Chonchi",
        "id": 215,
        "key": 215,
        "region_id": 12
    },
    {
        "label": "Dalcahue",
        "id": 224,
        "key": 224,
        "region_id": 12
    },
    {
        "label": "Quinchao",
        "id": 225,
        "key": 225,
        "region_id": 12
    },
    {
        "label": "Maullín",
        "id": 229,
        "key": 229,
        "region_id": 12
    },
    {
        "label": "Coyhaique",
        "id": 172,
        "key": 172,
        "region_id": 13
    },
    {
        "label": "Puerto Aysén",
        "id": 173,
        "key": 173,
        "region_id": 13
    },
    {
        "label": "Chile Chico",
        "id": 212,
        "key": 212,
        "region_id": 13
    },
    {
        "label": "Cochrane",
        "id": 266,
        "key": 266,
        "region_id": 13
    },
    {
        "label": "Punta Arenas",
        "id": 174,
        "key": 174,
        "region_id": 14
    },
    {
        "label": "Puerto Natales",
        "id": 175,
        "key": 175,
        "region_id": 14
    },
    {
        "label": "Puerto Williams",
        "id": 211,
        "key": 211,
        "region_id": 14
    },
    {
        "label": "Santiago",
        "id": 176,
        "key": 176,
        "region_id": 15
    },
    {
        "label": "San José de Maipo",
        "id": 177,
        "key": 177,
        "region_id": 15
    },
    {
        "label": "Colina",
        "id": 178,
        "key": 178,
        "region_id": 15
    },
    {
        "label": "Lampa",
        "id": 179,
        "key": 179,
        "region_id": 15
    },
    {
        "label": "Batuco",
        "id": 180,
        "key": 180,
        "region_id": 15
    },
    {
        "label": "Tiltil",
        "id": 181,
        "key": 181,
        "region_id": 15
    },
    {
        "label": "Buin",
        "id": 182,
        "key": 182,
        "region_id": 15
    },
    {
        "label": "Alto Jahuel",
        "id": 183,
        "key": 183,
        "region_id": 15
    },
    {
        "label": "Bajos de San Agustín",
        "id": 184,
        "key": 184,
        "region_id": 15
    },
    {
        "label": "Paine",
        "id": 185,
        "key": 185,
        "region_id": 15
    },
    {
        "label": "Hospital",
        "id": 186,
        "key": 186,
        "region_id": 15
    },
    {
        "label": "Melipilla",
        "id": 187,
        "key": 187,
        "region_id": 15
    },
    {
        "label": "Curacaví",
        "id": 188,
        "key": 188,
        "region_id": 15
    },
    {
        "label": "Talagante",
        "id": 189,
        "key": 189,
        "region_id": 15
    },
    {
        "label": "El Monte",
        "id": 190,
        "key": 190,
        "region_id": 15
    },
    {
        "label": "Isla de Maipo",
        "id": 191,
        "key": 191,
        "region_id": 15
    },
    {
        "label": "La Islita",
        "id": 192,
        "key": 192,
        "region_id": 15
    },
    {
        "label": "Peñaflor",
        "id": 193,
        "key": 193,
        "region_id": 15
    },
    {
        "label": "Chillán",
        "id": 106,
        "key": 106,
        "region_id": 27
    },
    {
        "label": "Chillán Viejo",
        "id": 107,
        "key": 107,
        "region_id": 27
    },
    {
        "label": "Bulnes",
        "id": 123,
        "key": 123,
        "region_id": 27
    },
    {
        "label": "Coelemu",
        "id": 124,
        "key": 124,
        "region_id": 27
    },
    {
        "label": "Coihueco",
        "id": 125,
        "key": 125,
        "region_id": 27
    },
    {
        "label": "Quillón",
        "id": 126,
        "key": 126,
        "region_id": 27
    },
    {
        "label": "Quirihue",
        "id": 127,
        "key": 127,
        "region_id": 27
    },
    {
        "label": "San Carlos",
        "id": 128,
        "key": 128,
        "region_id": 27
    },
    {
        "label": "Yungay",
        "id": 129,
        "key": 129,
        "region_id": 27
    }
]