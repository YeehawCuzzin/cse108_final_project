import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button, PasswordInput, Stack, Text, TextInput, Anchor } from '@mantine/core'
import AuthShell from '../components/AuthShell'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setNotFound(false)
    setLoading(true)
    try {
      await login(username, password)
      navigate('/dashboard')
    } catch (err) {
      if (err.message === 'account_not_found') {
        setNotFound(true)
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      mode="login"
      title="Log in"
      description="Pick up where you left off and let Pluto keep tracking the patterns in your spending."
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
            {notFound && (
              <Text c="#FF9393" size="sm">
                This account does not exist. Make sure to{' '}
                <Anchor component={Link} to="/register" c="#FF9393" fw={600}>
                  register
                </Anchor>{' '}
                a new account.
              </Text>
            )}
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
              Log In
            </Button>
            <Text ta="center" size="sm" c="#98A29B">
              Don&apos;t have an account?{' '}
              <Anchor component={Link} to="/register" c="#DDE5DE">
                Register
              </Anchor>
            </Text>
          </Stack>
        </form>
    </AuthShell>
  )
}
