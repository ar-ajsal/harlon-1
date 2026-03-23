import { createContext, useContext, useState, useCallback } from 'react'

const CartContext = createContext()

export function useCart() {
    return useContext(CartContext)
}

export function CartProvider({ children }) {
    const [items, setItems] = useState([])
    const [isOpen, setIsOpen] = useState(false)

    const openCart = () => setIsOpen(true)
    const closeCart = () => setIsOpen(false)
    const toggleCart = () => setIsOpen(o => !o)

    const addItem = useCallback((product, size) => {
        setItems(prev => {
            const key = `${product._id}-${size}`
            const exists = prev.find(i => i.key === key)
            if (exists) {
                return prev.map(i => i.key === key ? { ...i, qty: i.qty + 1 } : i)
            }
            return [...prev, {
                key,
                id: product._id,
                name: product.name,
                price: product.discountedPrice || product.price,
                image: product.images?.[0] || '',
                size,
                qty: 1,
            }]
        })
        setIsOpen(true)
    }, [])

    const removeItem = useCallback((key) => {
        setItems(prev => prev.filter(i => i.key !== key))
    }, [])

    const updateQty = useCallback((key, qty) => {
        if (qty < 1) return
        setItems(prev => prev.map(i => i.key === key ? { ...i, qty } : i))
    }, [])

    const clearCart = useCallback(() => setItems([]), [])

    const totalItems = items.reduce((sum, i) => sum + i.qty, 0)
    const totalPrice = items.reduce((sum, i) => sum + i.price * i.qty, 0)

    return (
        <CartContext.Provider value={{
            items, isOpen, totalItems, totalPrice,
            openCart, closeCart, toggleCart,
            addItem, removeItem, updateQty, clearCart,
        }}>
            {children}
        </CartContext.Provider>
    )
}
