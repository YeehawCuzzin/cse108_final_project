import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Container, Group, Title, Text, Button } from '@mantine/core'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Container mt={40}>
      <Group justify="space-between" mb="md">
        <Title order={1}>FlowFundAI</Title>
        <Button variant="subtle" onClick={handleLogout}>Log Out</Button>
      </Group>
      <Text>Welcome, {user?.username}!</Text>
    </Container>
  )
}
