import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Container, Group, Title, Text, Button, Paper, Stack } from '@mantine/core'

export default function Dashboard() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <Container size="lg" mt={40}>
            <Group justify="space-between" mb="md">
                <div>
                    <Title order={1}>FlowFundAI</Title>
                    <Text c="dimmed">Welcome, {user?.username}!</Text>
                </div>

                <Group>
                    <Button variant="light" onClick={() => navigate('/settings')}>
                        Settings
                    </Button>
                    <Button variant="subtle" color="red" onClick={handleLogout}>
                        Log Out
                    </Button>
                </Group>
            </Group>

            <Paper withBorder shadow="sm" p="lg" radius="md">
                <Stack>
                    <Title order={3}>Dashboard</Title>
                    <Text>
                        Your account is authenticated and protected.
                    </Text>
                    <Text c="dimmed" size="sm">
                        Current status: authentication works, protected routing works, and account settings will be added next.
                    </Text>
                </Stack>
            </Paper>
        </Container>
    )
} 