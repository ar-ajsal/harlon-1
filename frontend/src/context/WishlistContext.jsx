/**
 * WishlistContext — Global wishlist state backed by localStorage
 * Provides: wishlist[], addToWishlist, removeFromWishlist, isWishlisted, clearWishlist
 */
import { createContext, useContext, useState, useEffect } from 'react'

const WishlistContext = createContext()

export function useWishlist() {
    return useContext(WishlistContext)
}

export function WishlistProvider({ children }) {
    const [wishlist, setWishlist] = useState(() => {
        try {
            const stored = localStorage.getItem('harlon_wishlist')
            return stored ? JSON.parse(stored) : []
        } catch {
            return []
        }
    })

    // Persist on every change
    useEffect(() => {
        try {
            localStorage.setItem('harlon_wishlist', JSON.stringify(wishlist))
        } catch { }
    }, [wishlist])

    const addToWishlist = (product) => {
        setWishlist(prev => {
            if (prev.find(p => p._id === product._id)) return prev
            return [...prev, product]
        })
    }

    const removeFromWishlist = (productId) => {
        setWishlist(prev => prev.filter(p => p._id !== productId))
    }

    const isWishlisted = (productId) => {
        return wishlist.some(p => p._id === productId)
    }

    const toggleWishlist = (product) => {
        if (isWishlisted(product._id)) {
            removeFromWishlist(product._id)
        } else {
            addToWishlist(product)
        }
    }

    const clearWishlist = () => setWishlist([])

    return (
        <WishlistContext.Provider value={{
            wishlist,
            addToWishlist,
            removeFromWishlist,
            isWishlisted,
            toggleWishlist,
            clearWishlist
        }}>
            {children}
        </WishlistContext.Provider>
    )
}
