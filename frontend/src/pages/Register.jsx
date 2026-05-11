import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Center, Container, Paper, Title, TextInput, PasswordInput, Button, Text, Anchor, Stack, Image } from '@mantine/core'
import flowfundLogo from '../assets/flowfund.svg'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await register(username, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container size={420} mt={80}>
      <Center mb="lg">
        <Image src={flowfundLogo} alt="FlowFund" w={190} fit="contain" />
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
            <PasswordInput
              label="Confirm Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
            {error && <Text c="red" size="sm">{error}</Text>}
            <Button type="submit" fullWidth mt="xs" loading={loading}>Create Account</Button>
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
