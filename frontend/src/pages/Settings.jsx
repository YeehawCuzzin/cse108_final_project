import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
    Container,
    Group,
    Title,
    Text,
    Button,
    Paper,
    Stack,
    Divider,
    Badge,
    SimpleGrid,
    Card
} from '@mantine/core'

export default function Settings() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const createdAt = user?.created_at
        ? new Date(user.created_at.endsWith('Z') ? user.created_at : `${user.created_at}Z`).toLocaleString()
        : 'Not available'

    return (
        <Container size="lg" mt={40} mb={60}>
            <Group justify="space-between" mb="lg">
                <div>
                    <Title order={1}>Settings</Title>
                    <Text c="dimmed">Manage your account, privacy, and security preferences.</Text>
                </div>

                <Group>
                    <Button variant="light" onClick={() => navigate('/dashboard')}>
                        Back to Dashboard
                    </Button>
                    <Button color="red" variant="subtle" onClick={handleLogout}>
                        Log Out
                    </Button>
                </Group>
            </Group>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                <Paper withBorder shadow="sm" p="lg" radius="md">
                    <Title order={3} mb="sm">Account</Title>
                    <Stack gap="xs">
                        <Text>
                            <strong>Username:</strong> {user?.username || 'Unknown'}
                        </Text>
                        <Text>
                            <strong>User ID:</strong> {user?.id || 'Unknown'}
                        </Text>
                        <Text>
                            <Text><strong>Account Created:</strong> {createdAt}</Text>
                        </Text>
                        <Badge color="blue" variant="light" mt="xs">
                            Active Account
                        </Badge>
                    </Stack>
                </Paper>

                <Paper withBorder shadow="sm" p="lg" radius="md">
                    <Title order={3} mb="sm">Login & Security</Title>
                    <Stack gap="xs">
                        <Text>
                            Your account uses password-based login with protected authentication.
                        </Text>
                        <Text c="dimmed" size="sm">
                            Password changes and two-factor authentication can be added as future improvements.
                        </Text>
                        <Badge color="green" variant="light" mt="xs">
                            Protected Route Enabled
                        </Badge>
                    </Stack>
                </Paper>

                <Paper withBorder shadow="sm" p="lg" radius="md">
                    <Title order={3} mb="sm">Privacy</Title>
                    <Stack gap="xs">
                        <Text>
                            FlowFundAI is designed so each user only sees their own financial data.
                        </Text>
                        <Text c="dimmed" size="sm">
                            Transaction, budget, and document routes should always check the logged-in user before returning data.
                        </Text>
                        <Badge color="violet" variant="light" mt="xs">
                            User Data Separation Required
                        </Badge>
                    </Stack>
                </Paper>

                <Paper withBorder shadow="sm" p="lg" radius="md">
                    <Title order={3} mb="sm">Documents</Title>
                    <Stack gap="xs">
                        <Text>
                            Uploaded financial documents should be processed only for the user who uploaded them.
                        </Text>
                        <Text c="dimmed" size="sm">
                            Demo documents should not contain real financial information. Future versions should include document deletion.
                        </Text>
                        <Badge color="orange" variant="light" mt="xs">
                            Document Safety Checklist
                        </Badge>
                    </Stack>
                </Paper>
            </SimpleGrid>

            <Card withBorder shadow="sm" p="lg" radius="md" mt="lg">
                <Title order={3} mb="sm">Privacy Checklist for Demo</Title>
                <Divider mb="md" />
                <Stack gap="xs">
                    <Text>• All protected pages should require a logged-in user.</Text>
                    <Text>• All transaction routes should require JWT authentication.</Text>
                    <Text>• All database queries should filter by the current user ID.</Text>
                    <Text>• Users should not be able to access another user’s transactions by guessing an ID.</Text>
                    <Text>• Uploaded documents and API keys should never be committed to GitHub.</Text>
                </Stack>
            </Card>
        </Container>
    )
} 