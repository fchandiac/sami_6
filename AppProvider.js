import React, { useReducer } from 'react'

const AppContext = React.createContext()
const useAppContext = () => React.useContext(AppContext)

const initialState = {
    cart: [],
    cartChanged: false,
    total: 0,
    lock: true,
    snackState: false,
    snackType: 'error',
    snackMessage: '',
    productRemoved: {}
}

const reducer = (state, action) => {
    switch (action.type) {
        case 'ADD_TO_CART':
            if (state.cart.find((item) => item.id === action.value.id)) {
                let productIndex = state.cart.findIndex((item) => item.id === action.value.id)
                state.cart[productIndex].quanty += 1
                state.cart[productIndex].salesRoomStock -= 1
                state.cart[productIndex].subTotal = roundToNearestTenth(state.cart[productIndex].quanty * state.cart[productIndex].sale) * (1 - state.cart[productIndex].discount / 100)
                state.total = 0
                state.cart.map((item) => state.total += item.subTotal)
                return { ...state, cart: state.cart, total: state.total, cartChanged: !state.cartChanged  }
            } else {
                action.value.subTotal = roundToNearestTenth(action.value.sale)
                action.value.salesRoomStock -= 1
                state.cart = [...state.cart, action.value]
                state.total = 0
                state.cart.map((item) => state.total += item.subTotal)
                return { ...state, cart: state.cart, total: state.total, cartChanged: !state.cartChanged }
            }

        case 'REMOVE_FROM_CART':
            state.cart = state.cart.filter((item) => item.id !== action.value)
            state.total = 0
            state.cart.map((item) => state.total += item.subTotal)
            return { ...state, cart: state.cart, total: state.total, cartChanged: !state.cartChanged, productRemoved: action.value  }
        case 'CLEAR_CART':
            return { ...state, cart: [], total: 0, cartChanged: !state.cartChanged }
        case 'SUBSTRACT_QUANTY':
            let quanty = state.cart.find((item) => item.id === action.value).quanty
            if (quanty === 1) {
                state.cart = state.cart.filter((item) => item.id !== action.value)
                state.total = 0
                state.cart.map((item) => state.total += item.subTotal)
                return { ...state, cart: state.cart, total: state.total,  cartChanged: !state.cartChanged, productRemoved: action.value }
            } else {
                let productIndex = state.cart.findIndex((item) => item.id === action.value)
                state.cart[productIndex].quanty -= 1
                state.cart[productIndex].salesRoomStock += 1
                state.cart[productIndex].subTotal = (state.cart[productIndex].quanty * state.cart[productIndex].sale) * (1 - state.cart[productIndex].discount / 100)
                state.cart[productIndex].subTotal = roundToNearestTenth(state.cart[productIndex].subTotal)
                state.total = 0
                state.cart.map((item) => state.total += item.subTotal)
                return { ...state, cart: state.cart, total: state.total,  cartChanged: !state.cartChanged, productRemoved: action.value }
            }
        case 'ADD_QUANTY':
            let productIndex = state.cart.findIndex((item) => item.id === action.value)
            state.cart[productIndex].quanty += 1
            state.cart[productIndex].salesRoomStock -= 1
            state.cart[productIndex].subTotal = (state.cart[productIndex].quanty * state.cart[productIndex].sale) * (1 - state.cart[productIndex].discount / 100)
            state.cart[productIndex].subTotal = roundToNearestTenth(state.cart[productIndex].subTotal)
            state.total = 0
            state.cart.map((item) => state.total += item.subTotal)
            return { ...state, cart: state.cart, total: state.total, cartChanged: !state.cartChanged }
        case 'EDIT_QUANTY':
            let productIndx = state.cart.findIndex((item) => item.id === action.value.id)
            state.cart[productIndx].quanty = action.value.quanty
            state.cart[productIndx].subTotal = (state.cart[productIndx].quanty * state.cart[productIndx].sale) * (1 - state.cart[productIndex].discount / 100)
            state.cart[productIndx].subTotal = roundToNearestTenth(state.cart[productIndx].subTotal)
            state.total = 0
            state.cart.map((item) => state.total += item.subTotal)
            return { ...state, cart: state.cart, total: state.total }
        case 'LOCK':
            return { ...state, lock: true }
        case 'UNLOCK':
            return { ...state, lock: false }
        case 'ADD_DISCOUNT':
            let productInd = state.cart.findIndex((item) => item.id === action.value)
            state.cart[productInd].discount += 1
            state.cart[productInd].subTotal = Math.round((state.cart[productInd].quanty * state.cart[productInd].sale) * (1 - state.cart[productInd].discount / 100))
            state.cart[productInd].subTotal = roundToNearestTenth(state.cart[productInd].subTotal)
            state.total = 0
            state.cart.map((item) => state.total += item.subTotal)
            return { ...state, cart: state.cart, total: state.total }
        case 'SUBSTRACT_DISCOUNT':
            let productI = state.cart.findIndex((item) => item.id === action.value)
            if (state.cart[productI].discount <= 1) {
                state.cart[productI].discount = 0
                state.cart[productI].subTotal = Math.round((state.cart[productI].quanty * state.cart[productI].sale) * (1 - state.cart[productI].discount / 100))
                state.cart[productI].subTotal = roundToNearestTenth(state.cart[productI].subTotal)
                state.total = 0
                state.cart.map((item) => state.total += item.subTotal)
            } else {
                state.cart[productI].discount += -1
                state.cart[productI].subTotal = Math.round((state.cart[productI].quanty * state.cart[productI].sale) * (1 - state.cart[productI].discount / 100))
                state.cart[productI].subTotal = roundToNearestTenth(state.cart[productI].subTotal)
                state.total = 0
                state.cart.map((item) => state.total += item.subTotal)
            }
            return { ...state, cart: state.cart, total: state.total }
        case 'GLOBAL_DISCOUNT':
            state.cart.map((item) => {
                item.discount = action.value
                item.subTotal = Math.round((item.quanty * item.sale) * (1 - item.discount / 100))
                item.subTotal = roundToNearestTenth(item.subTotal)
            })
            state.total = 0
            state.cart.map((item) => state.total += item.subTotal)
            return { ...state, cart: state.cart, total: state.total }
        case 'OPEN_SNACK':
            return { ...state, snackState: true, snackType: action.value.type, snackMessage: action.value.message }
        case 'CLOSE_SNACK':
            return { ...state, snackState: false }
        default:
            return state
    }
}

const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState)
    return (
        <AppContext.Provider value={{
            cart: state.cart,
            total: state.total,
            lock: state.lock,
            snackState: state.snackState,
            snackType: state.snackType,
            snackMessage: state.snackMessage,
            cartChanged: state.cartChanged,
            productRemoved: state.productRemoved,
            dispatch
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
