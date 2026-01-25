import { createContext, useContext, useState, useEffect } from 'react'
import { productsApi, categoriesApi } from '../services/api'

const ProductContext = createContext()

export function useProducts() {
    return useContext(ProductContext)
}

export function ProductProvider({ children }) {
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            setError(null)

            const [productsData, categoriesData] = await Promise.all([
                productsApi.getAll(),
                categoriesApi.getAll()
            ])

            // Handle ApiResponse structure { success: true, data: [...] }
            setProducts(productsData.data || productsData || [])
            setCategories(categoriesData.data || categoriesData || [])
        } catch (err) {
            console.error('Error loading data:', err)
            setError('Failed to load data. Make sure the server is running.')
        } finally {
            setLoading(false)
        }
    }

    const addProduct = async (product) => {
        try {
            const response = await productsApi.create(product)
            const newProduct = response.data || response
            setProducts(prev => [newProduct, ...prev])
            return newProduct
        } catch (err) {
            console.error('Error adding product:', err)
            throw err
        }
    }

    const updateProduct = async (id, updates) => {
        try {
            const response = await productsApi.update(id, updates)
            const updatedProduct = response.data || response
            setProducts(prev => prev.map(p => p._id === id ? updatedProduct : p))
            return updatedProduct
        } catch (err) {
            console.error('Error updating product:', err)
            throw err
        }
    }

    const deleteProduct = async (id) => {
        try {
            await productsApi.delete(id)
            setProducts(prev => prev.filter(p => p._id !== id))
        } catch (err) {
            console.error('Error deleting product:', err)
            throw err
        }
    }

    const getProduct = (id) => {
        return products.find(p => p._id === id || p.id === id)
    }

    const getProductsByCategory = (category) => {
        if (!category || category === 'all') return products
        return products.filter(p => p.category.toLowerCase() === category.toLowerCase())
    }

    const addCategory = async (category) => {
        try {
            const response = await categoriesApi.create(category)
            const newCategory = response.data || response
            setCategories(prev => [...prev, newCategory])
            return newCategory
        } catch (err) {
            console.error('Error adding category:', err)
            throw err
        }
    }

    const updateCategory = async (id, updates) => {
        try {
            const response = await categoriesApi.update(id, updates)
            const updatedCategory = response.data || response
            setCategories(prev => prev.map(c => c._id === id ? updatedCategory : c))
            return updatedCategory
        } catch (err) {
            console.error('Error updating category:', err)
            throw err
        }
    }

    const deleteCategory = async (id) => {
        try {
            await categoriesApi.delete(id)
            setCategories(prev => prev.filter(c => c._id !== id))
        } catch (err) {
            console.error('Error deleting category:', err)
            throw err
        }
    }

    const refreshData = () => {
        loadData()
    }

    const value = {
        products,
        categories,
        loading,
        error,
        addProduct,
        updateProduct,
        deleteProduct,
        getProduct,
        getProductsByCategory,
        addCategory,
        updateCategory,
        deleteCategory,
        refreshData
    }

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    )
}
