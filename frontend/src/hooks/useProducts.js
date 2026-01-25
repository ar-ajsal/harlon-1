import { useState, useEffect, useCallback } from 'react';
import { productsApi } from '../api/products.api';

/**
 * Custom hook for fetching all products with filters
 * @param {Object} initialFilters - Initial filter parameters
 * @returns {Object} products, loading, error, and refetch function
 */
export function useProducts(initialFilters = {}) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState(initialFilters);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await productsApi.getAll(filters);
            // Handle both {data: [...]} and [...] response formats
            setProducts(response.data || response);
        } catch (err) {
            setError(err.message);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const updateFilters = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    return {
        products,
        loading,
        error,
        refetch: fetchProducts,
        filters,
        updateFilters
    };
}

/**
 * Custom hook for fetching a single product by ID
 * @param {string} productId - Product ID
 * @returns {Object} product, loading, error
 */
export function useProduct(productId) {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!productId) {
            setLoading(false);
            return;
        }

        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await productsApi.getById(productId);
                setProduct(response.data || response);
            } catch (err) {
                setError(err.message);
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    return { product, loading, error };
}

/**
 * Custom hook for featured products
 * @returns {Object} products, loading, error
 */
export function useFeaturedProducts() {
    return useProducts({ featured: 'true' });
}

/**
 * Custom hook for best seller products
 * @returns {Object} products, loading, error
 */
export function useBestSellers() {
    return useProducts({ bestSeller: 'true' });
}
