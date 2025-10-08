import { Route, Routes, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import Dashboard from "./pages/admin/Dashboard";
import AdminServices from "./pages/admin/AdminServices";
import AdminStaff from "./pages/admin/AdminStaff";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminCalendar from "./pages/admin/AdminCalendar";
import Home from "./pages/customer/Home";
import Login from "./pages/customer/Login";
import Register from "./pages/customer/Register";
import ServicesList from "./pages/customer/ServicesList";
import ServiceDetail from "./pages/customer/ServiceDetail";
import Book from "./pages/customer/Book";
import MyAppointments from "./pages/customer/MyAppointments";
import Settings from "./pages/customer/Settings";
function Protected({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-6 text-center text-sm text-gray-600">Loading…</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen">
        <Navbar />
        <main className="w-full px-2">
<Routes>
  {/* Customer routes */}
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/services" element={<ServicesList />} />
  <Route path="/services/:id" element={<ServiceDetail />} />
  <Route
    path="/book/*"
    element={
      <Protected>
        <Book />
      </Protected>
    }
  />
  <Route
    path="/me/appointments"
    element={
      <Protected>
        <MyAppointments />
      </Protected>
    }
  />

  {/* Admin routes */}
  <Route
    path="/admin/dashboard"
    element={
      <Protected>
        <Dashboard />
      </Protected>
    }
  />
  <Route
    path="/admin/services"
    element={
      <Protected>
        <AdminServices />
      </Protected>
    }
  />
  <Route
    path="/admin/staff"
    element={
      <Protected>
        <AdminStaff />
      </Protected>
    }
  />
  <Route
    path="/admin/bookings"
    element={
      <Protected>
        <AdminBookings />
      </Protected>
    }
  />
  <Route
  path="/admin/categories"
  element={
    <Protected>
      <AdminCategories />
    </Protected>
  }
/>
<Route
  path="/admin/calendar"
  element={
    <Protected>
      <AdminCalendar />
    </Protected>
  }
/>

<Route
  path="/me/settings"
  element={
    <Protected>
      <Settings />
    </Protected>
  }
/>

  <Route path="*" element={<Navigate to="/" />} />
</Routes>

        </main>
      </div>
    </AuthProvider>
  );
}
