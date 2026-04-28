import { Navigate } from 'react-router-dom'
import { Center, Loader } from '@mantine/core'
import { useAuth } from '../context/AuthContext'

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <Center mt={100}><Loader /></Center>
  if (!user) return <Navigate to="/login" replace />
  return children
}
