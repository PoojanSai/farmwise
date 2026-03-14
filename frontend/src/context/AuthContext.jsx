import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api/services'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [farmer, setFarmer] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('access_token')
        if (token) {
            authAPI.getProfile()
                .then(res => setFarmer(res.data))
                .catch(() => localStorage.clear())
                .finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [])

    const login = async (email, password) => {
        const res = await authAPI.login({ email, password })
        localStorage.setItem('access_token', res.data.access)
        localStorage.setItem('refresh_token', res.data.refresh)
        setFarmer(res.data.farmer)
        toast.success(`Welcome back, ${res.data.farmer.full_name}! 🌾`)
        return res.data
    }

    const register = async (formData) => {
        const res = await authAPI.register(formData)
        toast.success('Registration successful! Please log in.')
        return res.data
    }

    const logout = () => {
        localStorage.clear()
        setFarmer(null)
        toast.success('Logged out successfully.')
    }

    const refreshProfile = async () => {
        const res = await authAPI.getProfile()
        setFarmer(res.data)
    }

    return (
        <AuthContext.Provider value={{ farmer, loading, login, register, logout, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
