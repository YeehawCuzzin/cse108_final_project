import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Container, Paper, Title, TextInput, PasswordInput,
  Button, Text, Anchor, Stack, Center
} from '@mantine/core'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setNotFound(false)
    try {
      await login(username, password)
      navigate('/dashboard')
    } catch (err) {
      if (err.message === 'account_not_found') {
        setNotFound(true)
      } else {
        setError(err.message)
      }
    }
  }

  return (
    <Container size={420} mt={80}>
      <Center mb="lg">
        <Title order={1}>FlowFundAI</Title>
      </Center>
      <Paper withBorder shadow="md" p={30} radius="md">
        <Title order={2} mb="md" ta="center">Log In</Title>
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
            <PasswordInput
              label="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            {notFound && (
              <Text c="red" size="sm">
                This account does not exist. Make sure to{' '}
                <Anchor component={Link} to="/register" c="red" fw={600}>
                  register
                </Anchor>{' '}
                a new account.
              </Text>
            )}
            {error && <Text c="red" size="sm">{error}</Text>}
            <Button type="submit" fullWidth mt="xs">Log In</Button>
          </Stack>
        </form>
        <Text ta="center" mt="md" size="sm">
          Don't have an account?{' '}
          <Anchor component={Link} to="/register">Register</Anchor>
        </Text>
      </Paper>
    </Container>
  )
}
