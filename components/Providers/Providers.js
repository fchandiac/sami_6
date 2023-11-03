import React, { useState } from 'react'
import ProviderForm from '../Forms/ProviderForm'


export default function Providers() {
    const [providerData, setProviderData] = useState(customerDataDefault())
    return (
        <>
            <ProviderForm
                dialog={false}
                edit={false}
                providerData={providerData}
                setProviderData={setProviderData}

            />
        </>
    )
}

function customerDataDefault() {
    return ({
        rut: '',
        name: '',
        activity: '',
        district: { key: 0, id: '', label: '' },
        city: { key: 0, id: '', label: '' },
        address: ''
    })
}