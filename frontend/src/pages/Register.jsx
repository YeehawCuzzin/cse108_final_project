import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button, PasswordInput, Stack, Text, TextInput, Anchor } from '@mantine/core'
import AuthShell from '../components/AuthShell'
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
    <AuthShell
      mode="register"
      title="Create your account"
      description="Set up your workspace and start bringing spending, imports, and Pluto into one place."
    >
        <form onSubmit={handleSubmit}>
          <Stack gap={18}>
            <TextInput
              label="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              styles={{
                label: { marginBottom: 8, fontSize: 14, color: '#E3E8E4' },
                input: {
                  height: 48,
                  background: '#171A17',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#F1F3F1',
                },
              }}
            />
            <PasswordInput
              label="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              styles={{
                label: { marginBottom: 8, fontSize: 14, color: '#E3E8E4' },
                input: {
                  height: 48,
                  background: '#171A17',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#F1F3F1',
                },
                innerInput: {
                  color: '#F1F3F1',
                },
              }}
            />
            <PasswordInput
              label="Confirm Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              styles={{
                label: { marginBottom: 8, fontSize: 14, color: '#E3E8E4' },
                input: {
                  height: 48,
                  background: '#171A17',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#F1F3F1',
                },
                innerInput: {
                  color: '#F1F3F1',
                },
              }}
            />
            {error && <Text c="#FF9393" size="sm">{error}</Text>}
            <Button
              type="submit"
              fullWidth
              loading={loading}
              radius="xl"
              styles={{
                root: {
                  height: 48,
                  background: '#66DD84',
                  color: '#101610',
                  fontSize: 15,
                  fontWeight: 700,
                },
                label: {
                  letterSpacing: '-0.03em',
                },
              }}
            >
              Create Account
            </Button>
            <Text ta="center" size="sm" c="#98A29B">
              Already have an account?{' '}
              <Anchor component={Link} to="/login" c="#DDE5DE">
                Log In
              </Anchor>
            </Text>
          </Stack>
        </form>
    </AuthShell>
  )
}
