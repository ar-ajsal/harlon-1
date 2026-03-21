import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function useTheme() {
    return useContext(ThemeContext)
}

export function ThemeProvider({ children }) {
    const theme = 'light'

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', 'light')
        document.documentElement.classList.remove('dark')
    }, [])

    const toggleTheme = () => {}

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}
