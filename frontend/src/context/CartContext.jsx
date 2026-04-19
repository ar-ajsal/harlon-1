import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { userApi } from '../api/user.api'

const CartContext = createContext()

export function useCart() {
    return useContext(CartContext)
}

const GUEST_CART_KEY = 'harlon_guest_cart'

function loadGuestCart() {
    try { return JSON.parse(localStorage.getItem(GUEST_CART_KEY)) || [] } catch { return [] }
}
function saveGuestCart(items) {
    try { localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items)) } catch { }
}

export function CartProvider({ children }) {
    const [items, setItems] = useState(loadGuestCart)
    const [isOpen, setIsOpen] = useState(false)
    // We read auth state via localStorage directly to avoid circular context dependency
    const getToken = () => localStorage.getItem('harlon_user_token')

    const synced = useRef(false)

    // Persist guest cart to localStorage
    useEffect(() => {
        const token = getToken()
        if (!token) saveGuestCart(items)
    }, [items])

    // On mount: if user is logged in, load their server cart and merge with guest cart
    useEffect(() => {
        const token = getToken()
        if (!token || synced.current) return
        synced.current = true

        const guestItems = loadGuestCart()
        userApi.getCart(token).then(res => {
            if (res.success) {
                const serverCart = res.data.cart || []
                // Merge: server cart + guest items that aren't already there
                const merged = [...serverCart]
                guestItems.forEach(gi => {
                    if (!merged.find(s => s.key === gi.key)) merged.push(gi)
                })
                setItems(merged)
                // Push merged cart to server
                userApi.syncCart(token, merged).catch(() => { })
                localStorage.removeItem(GUEST_CART_KEY)
            }
        }).catch(() => { })
    }, [])

    const openCart = () => setIsOpen(true)
    const closeCart = () => setIsOpen(false)
    const toggleCart = () => setIsOpen(o => !o)

    const addItem = useCallback((product, size) => {
        setItems(prev => {
            const key = `${product._id}-${size}`
            const exists = prev.find(i => i.key === key)
            let next
            if (exists) {
                next = prev.map(i => i.key === key ? { ...i, qty: i.qty + 1 } : i)
            } else {
                next = [...prev, {
                    key,
                    productId: product._id,
                    id: product._id,
                    name: product.name,
                    price: product.discountedPrice || product.price,
                    image: product.images?.[0] || '',
                    size,
                    qty: 1,
                }]
            }

            // Sync to server async
            const token = getToken()
            if (token) {
                const newItem = next.find(i => i.key === key)
                if (!exists) {
                    userApi.addToCart(token, {
                        productId: product._id,
                        name: product.name,
                        price: product.discountedPrice || product.price,
                        image: product.images?.[0] || '',
                        size, qty: 1,
                    }).catch(() => { })
                } else {
                    userApi.syncCart(token, next).catch(() => { })
                }
            }
            return next
        })
        setIsOpen(true)
    }, [])

    const removeItem = useCallback((key) => {
        setItems(prev => {
            const next = prev.filter(i => i.key !== key)
            const token = getToken()
            if (token) {
                userApi.removeFromCart(token, key).catch(() => { })
            }
            return next
        })
    }, [])

    const updateQty = useCallback((key, qty) => {
        if (qty < 1) return
        setItems(prev => {
            const next = prev.map(i => i.key === key ? { ...i, qty } : i)
            const token = getToken()
            if (token) userApi.syncCart(token, next).catch(() => { })
            return next
        })
    }, [])

    const clearCart = useCallback(() => {
        setItems([])
        const token = getToken()
        if (token) userApi.syncCart(token, []).catch(() => { })
        localStorage.removeItem(GUEST_CART_KEY)
    }, [])

    // Called after user logs in — re-sync
    const onUserLogin = useCallback((token) => {
        synced.current = false
        const guestItems = loadGuestCart()
        userApi.getCart(token).then(res => {
            const serverCart = res.data?.cart || []
            const merged = [...serverCart]
            guestItems.forEach(gi => {
                if (!merged.find(s => s.key === gi.key)) merged.push(gi)
            })
            setItems(merged)
            userApi.syncCart(token, merged).catch(() => { })
            localStorage.removeItem(GUEST_CART_KEY)
            synced.current = true
        }).catch(() => { })
    }, [])

    const totalItems = items.reduce((sum, i) => sum + i.qty, 0)
    const totalPrice = items.reduce((sum, i) => sum + i.price * i.qty, 0)

    return (
        <CartContext.Provider value={{
            items, isOpen, totalItems, totalPrice,
            openCart, closeCart, toggleCart,
            addItem, removeItem, updateQty, clearCart,
            onUserLogin,
        }}>
            {children}
        </CartContext.Provider>
    )
}
