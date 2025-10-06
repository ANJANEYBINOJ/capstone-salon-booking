import { Route, Routes, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import { AuthProvider, useAuth } from './auth/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ServicesList from './pages/ServicesList'
import ServiceDetail from './pages/ServiceDetail'
import Book from './pages/Book'
import MyAppointments from './pages/MyAppointments'


function Protected({ children }) {
const { user } = useAuth()
if (!user) return <Navigate to="/login" replace />
return children
}


export default function App() {
return (
<AuthProvider>
<div className="min-h-screen bg-gray-50 text-gray-900">
<Navbar />
<main className="mx-auto max-w-6xl px-4 py-6">
<Routes>
<Route path="/" element={<Home />} />
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />
<Route path="/services" element={<ServicesList />} />
<Route path="/services/:id" element={<ServiceDetail />} />
<Route path="/book/*" element={<Book />} />
<Route path="/me/appointments" element={<Protected><MyAppointments /></Protected>} />
<Route path="*" element={<Navigate to="/" />} />
</Routes>
</main>
</div>
</AuthProvider>
)
}