import React, { useState, useEffect } from 'react'
import { useAppContext } from '../../AppProvider'
import electron from 'electron'


const ipcRenderer = electron.ipcRenderer || false


const stocks = require('../../promises/stocks')
const products = require('../../promises/products')

function useCart() {
    const { cart, openSnack, setCart, setTotal, cartChanged, setActionType, setProduct } = useAppContext()
    const [globalStockControl, setGlobalStockControl] = useState(false)

    useEffect(() => {
        let globalStockControl = ipcRenderer.sendSync('get-cash-register-UI', 'sync').stock_control
        setGlobalStockControl(globalStockControl)
    }, [])

    const findProductById = async (id) => {
        const product = await products.findOneById(id)
        return product
    }

    const findProductByCode = async (code) => {
        const productList = await products.findOneByCode(code)
        let duplicate = false

        if (productList.length > 1) {
            productList.forEach(product => {
                if (product.code === code) {
                    duplicate = true
                }
            })
        } else if (productList.length === 0) {
            openSnack('error', 'Producto no encontrado')
            find = false
            return
        }

        return ({ duplicate: duplicate, productList: productList, product: productList[0], code: code })
    }

    const fortmatProductToCart = (product) => ({
        affected: product.affected,
        code: product.code,
        discount: 0,
        discountAmount: 0,
        id: product.id,
        name: product.name,
        quanty: 0,
        sale: product.sale,
        salesRoomStock: product.Stocks.filter(stock => stock.storage_id === 1001)[0].stock,
        specialProduct: false,
        stockControl: product.stock_control,
        subTotal: 0,
        virtualStock: (product.Stocks.filter(stock => stock.storage_id === 1001)[0].stock) - 1,
    })

    const addProductToCartFromCode = async (code) => {
        let findProduct = await findProductByCode(code)
        if (!findProduct) return
        if (findProduct.duplicate) {
            openSnack('error', 'Producto duplicado. Código: ' + findProduct.code)
            return
        } else {
            let product = fortmatProductToCart(findProduct.product)
            addToCart(product)
        }
    }

    const addToCart = (product) => {
        let index = indexProductInCart(product)
        if (index === -1) {
            if (globalStockControl) {
                if (!checkProductStock(product.stockControl, product.virtualStock)) return
            }
            product.quanty = 1
            product.subTotal = product.sale
            cart.push(product)
            setCart(cart)
            setTotalCart()
            cartChanged()
            setProduct(product.id, product.virtualStock, product.salesRoomStock)
            setActionType('NEW_ADD_TO_CART')

        } else {
            addExistingProductToCart(product)
            //cartChanged()

        }
    }

    const setTotalCart = () => {
        let total = 0
        cart.forEach(product => {
            total = total + product.subTotal
        })
        setTotal(total)
    }

    const checkProductStock = (stockControl, virtualStock) => {
        if (stockControl) {
            if (virtualStock < 0) {
                openSnack('error', 'Stock insuficiente')
                return false
            } else {
                return true
            }
        } else {
            return true
        }

    }

    const indexProductInCart = (product) => {
        let index = cart.findIndex((item) => item.id === product.id)
        return index
    }

    const productAddQuanty = (index, quanty) => {
        let product = cart[index]
        product.quanty = product.quanty + quanty
        product.virtualStock = product.virtualStock - quanty
        return product
    }

    const productCalcSubTotal = (index) => {
        let product = cart[index]
        product.subTotal = roundToNearestTenth(product.quanty * product.sale) * (1 - product.discount / 100)

        return product
    }

    const addExistingProductToCart = (product) => {
        let index = indexProductInCart(product)
        let  checkProduct = cart[index]
        if (globalStockControl) {
            if (checkProductStock(checkProduct.stockControl,( checkProduct.virtualStock - 1)) === false) return false
        }
        product = productAddQuanty(index, 1) 
        product = productCalcSubTotal(index)
        cart[index] = product
        setCart(cart)
        setTotalCart()
        cartChanged()
        setProduct(product.id, product.virtualStock, product.salesRoomStock)
        setActionType('ADD_TO_CART')
    }

    const getCart = () => cart



    return {
        getCart,
        findProductById,
        findProductByCode,
        addProductToCartFromCode,
    }


}

export default useCart


function roundToNearestTenth(number) {

    //Math.round(number)
    let lastDigit = number % 10; // Get the last digit of the number
    let nearestTenth = Math.floor(number / 10) * 10; // Round the number down to the nearest multiple of 10
    if (lastDigit >= 5) {
        return nearestTenth + 10; // If the last digit is greater than or equal to 5, return the nearest tenth obtained with the rounding plus 10
    } else {
        return nearestTenth; // If the last digit is less than 5, return the nearest tenth obtained with the rounding
    }
}