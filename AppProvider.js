import React, { useReducer } from 'react'
const AppContext = React.createContext()
const useAppContext = () => React.useContext(AppContext)

import electron from 'electron'
const ipcRenderer = electron.ipcRenderer || false


const initialState = {
    cart: [],
    cartChanged: false,
    total: 0,
    lock: true,
    snackState: false,
    snackType: 'error',
    snackMessage: '',
    product: 0,
    actionType: 'NONE_TYPE',
    pageTitle: '',
    stockAlertList: [],
    ordersMode: false,
    orders: true,
    ordersInCart: [],
    movements: { balance: 0, movements: [] },
    user: { id: 0, user: 'test', pass: '1234', name: 'UserVersión', profileId: 0, profile: 'Perfil', permissions: [] },
    webConnection: false,
    lioren: { integration: false, token: '', mail: '' },
    cashRegisterTab: 0,
    currentDocument: 0
}

const reducer = (state, action) => {
    switch (action.type) {
        case 'ADD_TO_CART':
            if (state.cart.find((item) => item.id === action.value.id)) {
                let productIndex = state.cart.findIndex((item) => item.id === action.value.id)
                state.cart[productIndex].quanty += 1
                state.cart[productIndex].stockControl ? state.cart[productIndex].virtualStock -= 1 : state.cart[productIndex].virtualStock = state.cart[productIndex].virtualStock
                state.cart[productIndex].subTotal = roundToNearestTenth(state.cart[productIndex].quanty * state.cart[productIndex].sale) * (1 - state.cart[productIndex].discount / 100)
                state.cart[productIndex].discountAmount = Math.round((state.cart[productIndex].quanty * state.cart[productIndex].sale) * (state.cart[productIndex].discount / 100))
                state.total = 0
                state.cart.map((item) => state.total += item.subTotal)
                return {
                    ...state,
                    cart: state.cart,
                    total: state.total,
                    cartChanged: !state.cartChanged,
                    product: {
                        id: action.value.id,
                        virtualStock: state.cart[productIndex].virtualStock,
                        salesRoomStock: state.cart[productIndex].salesRoomStock
                    },
                    actionType: 'ADD_TO_CART'
                }
            } else {
                action.value.subTotal = roundToNearestTenth(action.value.sale)
                action.value.discountAmount = Math.round(action.value.sale * (action.value.discount / 100))
                action.value.stockControl ? action.value.virtualStock -= 1 : action.value.virtualStock = action.value.virtualStock
                state.cart = [...state.cart, action.value]
                state.total = 0
                state.cart.map((item) => state.total += item.subTotal)
                return {
                    ...state,
                    cart: state.cart,
                    total: state.total,
                    cartChanged: !state.cartChanged,
                    product: {
                        id: action.value.id,
                        virtualStock: action.value.virtualStock,
                        salesRoomStock: action.value.salesRoomStock
                    },
                    actionType: 'NEW_ADD_TO_CART'
                }
            }
            break
        case 'ADD_SPECIAL_TO_CART':
            state.cart = [...state.cart, action.value]
            state.total = 0
            state.cart.map((item) => state.total += item.subTotal)
            return {
                ...state,
                cart: state.cart,
                total: state.total,
                cartChanged: !state.cartChanged,
                // product: {
                //     id: action.value.id,
                //     virtualStock: action.value.virtualStock,
                //     salesRoomStock: action.value.salesRoomStock
                // },
                actionType: 'NONE_TYPE'
            }
            break
        case 'REMOVE_FROM_CART':
            let proIndex = state.cart.findIndex((item) => item.id === action.value.id)
            let specialProduct = state.cart[proIndex].specialProduct
            state.cart = state.cart.filter((item) => item.id !== action.value.id)
            state.total = 0
            state.cart.map((item) => state.total += item.subTotal)
            return {
                ...state,
                cart: state.cart,
                total: state.total,
                cartChanged: !state.cartChanged,
                product: {
                    id: action.value.id,
                    salesRoomStock: action.value.salesRoomStock
                },
                actionType: specialProduct ? 'NONE_TYPE' : 'REMOVE_FROM_CART'
            }
            break
        case 'CLEAR_CART':
            return { ...state, cart: [], total: 0, cartChanged: !state.cartChanged, actionType: 'CLEAR_CART' }
            break
        case 'SUBSTRACT_QUANTY':
            let quanty = state.cart.find((item) => item.id === action.value.id).quanty
            if (quanty === 1) {
                state.cart = state.cart.filter((item) => item.id !== action.value.id)
                state.total = 0
                state.cart.map((item) => state.total += item.subTotal)
                return {
                    ...state,
                    cart: state.cart,
                    total: state.total,
                    cartChanged: !state.cartChanged,
                    product: {
                        id: action.value.id,
                        salesRoomStock: action.value.salesRoomStock,
                        specialProduct: action.value.specialProduct
                    }, actionType: 'REMOVE_FROM_CART'
                }
            } else {
                let productIndex = state.cart.findIndex((item) => item.id === action.value.id)
                state.cart[productIndex].quanty -= 1
                state.cart[productIndex].stockControl ? state.cart[productIndex].virtualStock += 1 : state.cart[productIndex].virtualStock = state.cart[productIndex].virtualStock
                state.cart[productIndex].subTotal = (state.cart[productIndex].quanty * state.cart[productIndex].sale) * (1 - state.cart[productIndex].discount / 100)
                state.cart[productIndex].subTotal = roundToNearestTenth(state.cart[productIndex].subTotal)
                state.cart[productIndex].discountAmount = Math.round((state.cart[productIndex].quanty * state.cart[productIndex].sale) * (state.cart[productIndex].discount / 100))
                state.total = 0
                state.cart.map((item) => state.total += item.subTotal)
                return {
                    ...state,
                    cart: state.cart,
                    total: state.total,
                    cartChanged: !state.cartChanged,
                    product: {
                        id: action.value.id,
                        virtualStock: state.cart[productIndex].virtualStock,
                        salesRoomStock: state.cart[productIndex].salesRoomStock,
                        specialProduct: state.cart[productIndex].specialProduct
                    },
                    actionType: 'SUBSTRACT_QUANTY'
                }
            }
            break
        case 'ADD_QUANTY':
            const stockControl = ipcRenderer.sendSync('get-cash-register-UI', 'sync').stock_control
            let productIndex = state.cart.findIndex((item) => item.id === action.value.id)
            if (stockControl == false) { state.cart[productIndex].virtualStock += 1 }
            state.cart[productIndex].quanty += 1
            state.cart[productIndex].stockControl ? state.cart[productIndex].virtualStock -= 1 : state.cart[productIndex].virtualStock = state.cart[productIndex].virtualStock
            state.cart[productIndex].subTotal = (state.cart[productIndex].quanty * state.cart[productIndex].sale) * (1 - state.cart[productIndex].discount / 100)
            state.cart[productIndex].subTotal = roundToNearestTenth(state.cart[productIndex].subTotal)
            state.cart[productIndex].discountAmount = Math.round((state.cart[productIndex].quanty * state.cart[productIndex].sale) * (state.cart[productIndex].discount / 100))
            state.total = 0
            state.cart.map((item) => state.total += item.subTotal)
            return {
                ...state,
                cart: state.cart,
                total: state.total,
                cartChanged: !state.cartChanged,
                product: {
                    id: action.value.id,
                    virtualStock: state.cart[productIndex].virtualStock,
                    salesRoomStock: state.cart[productIndex].salesRoomStock,
                    specialProduct: state.cart[productIndex].specialProduct
                }, actionType: 'ADD_QUANTY'
            }
            break
        case 'EDIT_QUANTY':
            let productIndx = state.cart.findIndex((item) => item.id === action.value.id)
            let editQuanty = isNaN(parseFloat(action.value.quanty)) ? action.value.id : parseFloat(action.value.quanty)
            let vrStock = state.cart[productIndx].stockControl ? (state.cart[productIndx].salesRoomStock - editQuanty) : state.cart[productIndx].salesRoomStock
            let desc = state.cart[productIndx].discount
            state.cart[productIndx].quanty = editQuanty
            state.cart[productIndx].virtualStock = vrStock
            state.cart[productIndx].subTotal = (state.cart[productIndx].quanty * state.cart[productIndx].sale) * (1 - (desc / 100))
            state.cart[productIndx].subTotal = roundToNearestTenth(state.cart[productIndx].subTotal)
            state.cart[productIndx].discountAmount = Math.round((state.cart[productIndx].quanty * state.cart[productIndx].sale) * (state.cart[productIndx].discount / 100))
            state.total = 0
            state.cart.map((item) => state.total += item.subTotal)
            return {
                ...state,
                cart: state.cart,
                total: state.total,
                cartChanged: !state.cartChanged,
                product: {
                    id: action.value.id,
                    virtualStock: vrStock,
                    salesRoomStock: state.cart[productIndx].salesRoomStock,
                    specialProduct: state.cart[productIndx].specialProduct
                },
                actionType: 'EDIT_QUANTY'
            }
            break
        case 'LOCK':
            return { ...state, lock: true }
            break
        case 'UNLOCK':
            return { ...state, lock: false }
            break
        case 'ADD_DISCOUNT':
            let productInd = state.cart.findIndex((item) => item.id === action.value)
            
            let disc = parseInt(state.cart[productInd].discount)
            state.cart[productInd].discount = disc += 1
            state.cart[productInd].subTotal = Math.round((state.cart[productInd].quanty * state.cart[productInd].sale) * (1 - (state.cart[productInd].discount / 100)))
            state.cart[productInd].subTotal = roundToNearestTenth(state.cart[productInd].subTotal)
            state.cart[productInd].discountAmount = Math.round((state.cart[productInd].quanty * state.cart[productInd].sale) * (state.cart[productInd].discount / 100))
            state.total = 0
            state.cart.map((item) => state.total += item.subTotal)
            return { ...state, cart: state.cart, total: state.total }
            break
        case 'SET_DISCOUNT':
            console.log('SET_DISCOUNT', action.value)
            let productIndexx = state.cart.findIndex((item) => item.id === action.value.id)
            let sale = state.cart[productIndexx].sale
            let amount = parseInt(action.value.amount)
            let discx = (amount / sale) * 100
            state.cart[productIndexx].discount = discx
            state.cart[productIndexx].subTotal = Math.round((state.cart[productIndexx].quanty * state.cart[productIndexx].sale) * (1 - (state.cart[productIndexx].discount / 100)))
            state.cart[productIndexx].subTotal = roundToNearestTenth(state.cart[productIndexx].subTotal)
            state.cart[productIndexx].discountAmount = amount
            state.total = 0
            state.cart.map((item) => state.total += item.subTotal)
            console.log('SET_DISCOUNT', state.cart[productIndexx].discount)
            return { ...state, cart: state.cart, total: state.total }
        case 'SUBSTRACT_DISCOUNT':
            let productI = state.cart.findIndex((item) => item.id === action.value)
            if (state.cart[productI].discount <= 1) {
                state.cart[productI].discount = 0
                state.cart[productI].subTotal = Math.round((state.cart[productI].quanty * state.cart[productI].sale) * (1 - state.cart[productI].discount / 100))
                state.cart[productI].subTotal = roundToNearestTenth(state.cart[productI].subTotal)
                state.cart[productI].discountAmount = Math.round((state.cart[productI].quanty * state.cart[productI].sale) * (state.cart[productI].discount / 100))
                state.total = 0
                state.cart.map((item) => state.total += item.subTotal)
            } else {
                state.cart[productI].discount += -1
                state.cart[productI].subTotal = Math.round((state.cart[productI].quanty * state.cart[productI].sale) * (1 - state.cart[productI].discount / 100))
                state.cart[productI].subTotal = roundToNearestTenth(state.cart[productI].subTotal)
                state.cart[productI].discountAmount = Math.round((state.cart[productI].quanty * state.cart[productI].sale) * (state.cart[productI].discount / 100))
                
                state.total = 0
                state.cart.map((item) => state.total += item.subTotal)
            }
            return { ...state, cart: state.cart, total: state.total }
            break
        case 'GLOBAL_DISCOUNT':
            state.cart.map((item) => {
                item.discount = action.value
                item.subTotal = Math.round((item.quanty * item.sale) * (1 - item.discount / 100))
                item.subTotal = roundToNearestTenth(item.subTotal)
            })
            state.total = 0
            state.cart.map((item) => state.total += item.subTotal)
            return { ...state, cart: state.cart, total: state.total }
            break
        case 'OPEN_SNACK':
            return { ...state, snackState: true, snackType: action.value.type, snackMessage: action.value.message }
        case 'CLOSE_SNACK':
            return { ...state, snackState: false }
        case 'SET_PAGE_TITLE':
            return { ...state, pageTitle: action.value }
        case 'SET_STOCK_ALERT_LIST':
            return { ...state, stockAlertList: action.value }
        case 'SET_ORDERS_MODE':
            return { ...state, ordersMode: action.value }
        case 'SET_ORDERS':
            return { ...state, orders: action.value }
        case 'SET_MOVEMENTS':
            return { ...state, movements: action.value }
        case 'SET_WEB_CONNECTION':
            return { ...state, webConnection: action.value }
        case 'SET_LIOREN':
            return { ...state, lioren: action.value }
        case 'SET_ORDERS_IN_CART':
            return { ...state, ordersInCart: action.value }
        case 'SET_CASH_REGISTER_TAB':
            return { ...state, cashRegisterTab: action.value }
        case 'SET_USER':
            return { ...state, user: action.value }
        case 'SET_CURRENT_DOCUMENT':
            return { ...state, currentDocument: action.value }
        case 'SET_CART':
            return { ...state, cart: action.value }
        case 'SET_TOTAL':
            return { ...state, total: action.value }
        case 'SET_CART_CHANGED':
            return { ...state, cartChanged: action.value }
        case 'SET_ACTION_TYPE':
            return { ...state, actionType: action.value }
        case 'SET_PRODUCT':
            return { ...state, product: action.value }
        default:
            console.log('No action type')
            break
    }
}

const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState)

    
    const setCurrentDocument = (value) => {
        dispatch({ type: 'SET_CURRENT_DOCUMENT', value: value })
    }

    const openSnack = (type, message) => {
        dispatch({ type: 'OPEN_SNACK', value: { type: type, message: message } })
    }

    const getCart = () => {
        return state.cart
    }

    const setCart = (cart) => {
        dispatch({ type: 'SET_CART', value: cart })
    }

    const setTotal = (total) => {
        dispatch({ type: 'SET_TOTAL', value: total })
    }

    const cartChanged = () => {
        dispatch({ type: 'SET_CART_CHANGED', value: !state.cartChanged })
    }

    const setActionType = (actionType) => {
        dispatch({ type: 'SET_ACTION_TYPE', value: actionType })
    }

    const setProduct = (id, virtualStock, salesRoomStock) => {
        dispatch({ type: 'SET_PRODUCT', value: { id: id, virtualStock: virtualStock, salesRoomStock: salesRoomStock } })
    }


    return (
        <AppContext.Provider value={{
            cart: state.cart,
            total: state.total,
            lock: state.lock,
            snackState: state.snackState,
            snackType: state.snackType,
            snackMessage: state.snackMessage,
            cartChanged: state.cartChanged,
            product: state.product,
            actionType: state.actionType,
            pageTitle: state.pageTitle,
            stockAlertList: state.stockAlertList,
            ordersMode: state.ordersMode,
            movements: state.movements,
            user: state.user,
            orders: state.orders,
            webConnection: state.webConnection,
            lioren: state.lioren,
            ordersInCart: state.ordersInCart,
            cashRegisterTab: state.cashRegisterTab,
            currentDocument: state.currentDocument,
            setCurrentDocument,
            dispatch,
            openSnack,
            getCart,
            setCart,
            setTotal,
            cartChanged,
            setActionType,
            setProduct
        }}>
            {children}
        </AppContext.Provider>
    )
}

export { AppProvider, useAppContext }


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
