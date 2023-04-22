
import Image from 'next/image'
import React from 'react'
import Layout from '../components/Layout'

// EL img loader permite cargar imagenes desde otra fuente  y realizar next export
const imgLoader = ({ src }) => {
  return `http://localhost:3001/images/${src}`
}



export default function splash() {
  return (
      <Layout pageTitle='Image Test'>
        <Image loader={imgLoader} src='splash.jpg' alt="me" width="600" height="600" />
      </Layout>
  )
}
