import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Container, Paper, Title, TextInput, PasswordInput,
  Button, Text, Anchor, Stack, Center
} from '@mantine/core'

export default function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await register(username, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Container size={420} mt={80}>
      <Center mb="lg">
        <Title order={1}>FlowFundAI</Title>
      </Center>
      <Paper withBorder shadow="md" p={30} radius="md">
        <Title order={2} mb="md" ta="center">Create Account</Title>
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
            {error && <Text c="red" size="sm">{error}</Text>}
            <Button type="submit" fullWidth mt="xs">Create Account</Button>
          </Stack>
        </form>
        <Text ta="center" mt="md" size="sm">
          Already have an account?{' '}
          <Anchor component={Link} to="/login">Log In</Anchor>
        </Text>
      </Paper>
    </Container>
  )
}
