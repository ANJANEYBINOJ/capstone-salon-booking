/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react'
import { Auth } from '../api'


const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)


export function AuthProvider({ children }) {
const [user, setUser] = useState(null)
const [loading, setLoading] = useState(false)


const login = async (email, password) => {
setLoading(true)
try {
const data = await Auth.login({ email, password })
// backend returns {id, role, name}; cookie is set httpOnly
setUser({ id: data.id, role: data.role, name: data.name, email })
return data
} finally {
setLoading(false)
}
}


const register = async (name, email, password) => {
setLoading(true)
try {
await Auth.register({ name, email, password })
// auto-login after register for convenience
return await login(email, password)
} finally {
setLoading(false)
}
}


const logout = async () => {
await Auth.logout()
setUser(null)
}


const value = { user, setUser, login, register, logout, loading }
return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}