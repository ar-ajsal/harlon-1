import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { productsApi, categoriesApi } from '../services/api'

const ProductContext = createContext()

export function useProducts() {
    return useContext(ProductContext)
}

export function ProductProvider({ children }) {
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({
        page: 1,
        pages: 1,
        total: 0,
        limit: 12
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async (options = {}) => {
        try {
            setLoading(true)
            setError(null)

            const [productsResponse, categoriesData] = await Promise.all([
                productsApi.getAll({ page: 1, limit: 1000, ...options }), // Load visible products only (isVisible: true filter applies)
                categoriesApi.getAll({ limit: 1000 })
            ])

            // Handle pagination response structure
            const productsData = productsResponse.data?.data || productsResponse.data || productsResponse || []
            const paginationData = productsResponse.data?.pagination || productsResponse.pagination || { page: 1, pages: 1, total: productsData.length, limit: 12 }

            setProducts(Array.isArray(productsData) ? productsData : [])
            setPagination(paginationData)

            // Handle nested response structure: success.data.data
            const categoriesResult = categoriesData.data?.data || categoriesData.data || categoriesData || []
            setCategories(Array.isArray(categoriesResult) ? categoriesResult : [])
        } catch (err) {
            console.error('Error loading data:', err)
            setError('Failed to load data. Make sure the server is running.')
        } finally {
            setLoading(false)
        }
    }

    const loadMore = useCallback(async (page, filters = {}) => {
        try {
            setLoadingMore(true)
            const response = await productsApi.getAll({ page, limit: pagination.limit, ...filters })

            const newProducts = response.data?.data || response.data || response || []
            const newPagination = response.data?.pagination || response.pagination || pagination

            setProducts(prev => [...prev, ...(Array.isArray(newProducts) ? newProducts : [])])
            setPagination(newPagination)

            return { products: newProducts, pagination: newPagination }
        } catch (err) {
            console.error('Error loading more products:', err)
            throw err
        } finally {
            setLoadingMore(false)
        }
    }, [pagination.limit])

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

    const reorderProducts = async (updatedProducts) => {
        try {
            // Optimistic update
            setProducts(updatedProducts)

            // Extract only needed data for API
            const reorderData = updatedProducts.map((p, index) => ({
                _id: p._id,
                priority: updatedProducts.length - index // Higher priority for top items
            }))

            await productsApi.reorder(reorderData)
        } catch (err) {
            console.error('Error reordering products:', err)
            // Revert on error (would need previous state, but for now just logging)
            loadData()
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

    const loadAdminData = () => {
        return loadData({ _admin: true })
    }

    const hasMore = pagination.page < pagination.pages

    const value = {
        products,
        categories,
        loading,
        loadingMore,
        error,
        pagination,
        hasMore,
        addProduct,
        updateProduct,
        deleteProduct,
        reorderProducts,
        getProduct,
        getProductsByCategory,
        addCategory,
        updateCategory,
        deleteCategory,
        refreshData,
        loadAdminData,
        loadMore
    }

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    )
}
