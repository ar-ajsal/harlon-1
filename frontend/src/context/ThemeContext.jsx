import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function useTheme() {
    return useContext(ThemeContext)
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        try {
            return localStorage.getItem('harlon_theme') || 'light'
        } catch {
            return 'light'
        }
    })

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        document.documentElement.classList.toggle('dark', theme === 'dark')
        try {
            localStorage.setItem('harlon_theme', theme)
        } catch (_) {}
    }, [theme])

    const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'))

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}
