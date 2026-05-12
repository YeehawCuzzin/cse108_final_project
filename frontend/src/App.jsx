import { Navigate, Route, Routes } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute'
import ProtectedLayout from './components/ProtectedLayout'
import Dashboard from './pages/Dashboard'
import Imports from './pages/Imports'
import Transactions from './pages/Expenses'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Settings from './pages/Settings'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={(
          <PrivateRoute>
            <ProtectedLayout />
          </PrivateRoute>
        )}
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/expenses" element={<Navigate to="/transactions" replace />} />
        <Route path="/imports" element={<Imports />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
