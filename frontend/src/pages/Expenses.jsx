import { useEffect, useState } from 'react'
import {
  Button,
  Grid,
  Group,
  Loader,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { apiFetch } from '../lib/api'

const categories = ['Food', 'Transport', 'Housing', 'Entertainment', 'Health', 'Shopping', 'Education', 'Subscriptions', 'Other']

const emptyForm = {
  description: '',
  amount: '',
  category: 'Food',
  date: new Date().toISOString().slice(0, 10),
}

export default function Expenses() {
  const [transactions, setTransactions] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    let active = true

    async function loadTransactions() {
      try {
        const data = await apiFetch('/api/transactions')
        if (active) {
          setTransactions(data.transactions || [])
          setError('')
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadTransactions()

    return () => {
      active = false
    }
  }, [])

  const totalSpent = transactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0)
  const thisMonth = transactions
    .filter((transaction) => {
      const date = new Date(transaction.date)
      const now = new Date()
      return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
    })
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0)

  const categoriesSpent = {}
  transactions.forEach((transaction) => {
    categoriesSpent[transaction.category] = (categoriesSpent[transaction.category] || 0) + Number(transaction.amount || 0)
  })

  const categoryRows = Object.entries(categoriesSpent).sort((left, right) => right[1] - left[1])

  const dailyPulse = Array.from({ length: 7 }, (_, index) => {
    const day = new Date()
    day.setDate(day.getDate() - (6 - index))
    const dayKey = day.toISOString().slice(0, 10)
    const amount = transactions
      .filter((transaction) => transaction.date === dayKey)
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0)
    return { day: day.toLocaleDateString(undefined, { weekday: 'short' }), amount }
  })

  const pulseMax = Math.max(...dailyPulse.map((entry) => entry.amount), 1)

  async function refreshTransactions() {
    const data = await apiFetch('/api/transactions')
    setTransactions(data.transactions || [])
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setStatus('')
    setError('')

    try {
      await apiFetch('/api/transactions', {
        method: 'POST',
        body: JSON.stringify({
          description: form.description,
          amount: Number(form.amount),
          category: form.category,
          date: form.date,
        }),
      })

      await refreshTransactions()
      setForm({
        ...emptyForm,
        date: new Date().toISOString().slice(0, 10),
      })
      setStatus('Transaction saved to the React API.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    setError('')

    try {
      await apiFetch(`/api/transactions/${id}`, { method: 'DELETE' })
      await refreshTransactions()
      setStatus('Transaction deleted.')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <Stack gap="xl">
      <div>
        <Text c="#7f8a84" fw={600} mb={8}>Transactions</Text>
        <Title order={1} c="white">Spending workspace</Title>
        <Text c="#B5BAB7" mt={8}>Manual expenses and Gemini-imported transactions now live in one shared section.</Text>
      </div>

      <SimpleGrid cols={4} spacing="md">
        <Paper radius="xl" p="lg" style={{ background: '#1F1F1F', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Text c="#7f8a84" size="sm" fw={600}>Total tracked</Text>
          <Title order={2} c="white" mt={8}>${totalSpent.toFixed(2)}</Title>
        </Paper>
        <Paper radius="xl" p="lg" style={{ background: '#1F1F1F', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Text c="#7f8a84" size="sm" fw={600}>This month</Text>
          <Title order={2} c="white" mt={8}>${thisMonth.toFixed(2)}</Title>
        </Paper>
        <Paper radius="xl" p="lg" style={{ background: '#1F1F1F', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Text c="#7f8a84" size="sm" fw={600}>Transactions</Text>
          <Title order={2} c="white" mt={8}>{transactions.length}</Title>
        </Paper>
        <Paper radius="xl" p="lg" style={{ background: '#1F1F1F', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Text c="#7f8a84" size="sm" fw={600}>Top category</Text>
          <Title order={2} c="white" mt={8}>{categoryRows[0]?.[0] || 'None yet'}</Title>
        </Paper>
      </SimpleGrid>

      <Grid gutter="lg">
        <Grid.Col span={7}>
          <Stack gap="lg">
            <Paper radius="xl" p="xl" style={{ background: '#1F1F1F', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Group justify="space-between" align="flex-end" mb="lg">
                <div>
                  <Text c="#7f8a84" size="sm" fw={600}>Spending pulse</Text>
                  <Title order={3} c="white" mt={4}>Last 7 days</Title>
                </div>
                <Text c="#B5BAB7" size="sm">Inspired by the larger terminal direction</Text>
              </Group>

              <Group align="flex-end" gap="sm" wrap="nowrap" style={{ height: 220 }}>
                {dailyPulse.map((entry) => (
                  <Stack key={entry.day} gap={8} align="center" style={{ flex: 1, height: '100%', justifyContent: 'flex-end' }}>
                    <Paper
                      radius="md"
                      style={{
                        width: '100%',
                        height: `${Math.max((entry.amount / pulseMax) * 100, 8)}%`,
                        minHeight: 18,
                        background: 'linear-gradient(180deg, #7AE493 0%, #3B8F4C 100%)',
                      }}
                    />
                    <Text size="xs" c="#A5ADA8">{entry.day}</Text>
                  </Stack>
                ))}
              </Group>
            </Paper>

            <Paper radius="xl" p="xl" style={{ background: '#1F1F1F', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Title order={3} c="white" mb="md">Add transaction</Title>
              <Text c="#98A19B" size="sm" mb="md">
                Want to pull rows from a bank statement instead? Use the Imports page for PDF intake.
              </Text>

              <form onSubmit={handleSubmit}>
                <Stack gap="md">
                  <TextInput
                    label="Description"
                    value={form.description}
                    onChange={(event) => setForm((current) => ({ ...current, description: event.currentTarget.value }))}
                    placeholder="Coffee, rent, groceries..."
                    required
                  />
                  <Group grow>
                    <NumberInput
                      label="Amount"
                      value={form.amount}
                      min={0}
                      decimalScale={2}
                      fixedDecimalScale
                      onChange={(value) => setForm((current) => ({ ...current, amount: value }))}
                      placeholder="0.00"
                      required
                    />
                    <Select
                      label="Category"
                      data={categories}
                      value={form.category}
                      onChange={(value) => setForm((current) => ({ ...current, category: value || 'Other' }))}
                      allowDeselect={false}
                    />
                  </Group>
                  <TextInput
                    label="Date"
                    type="date"
                    value={form.date}
                    onChange={(event) => setForm((current) => ({ ...current, date: event.currentTarget.value }))}
                    required
                  />
                  <Group justify="space-between" align="center">
                    <div>
                      {status && <Text c="#6FE28C" size="sm">{status}</Text>}
                      {error && <Text c="#FF8787" size="sm">{error}</Text>}
                    </div>
                    <Button type="submit" color="green" loading={saving}>Save transaction</Button>
                  </Group>
                </Stack>
              </form>
            </Paper>
          </Stack>
        </Grid.Col>

        <Grid.Col span={5}>
          <Stack gap="lg">
            <Paper radius="xl" p="xl" style={{ background: '#1F1F1F', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Title order={3} c="white" mb="md">Category leaderboard</Title>
              {categoryRows.length ? (
                <Stack gap="sm">
                  {categoryRows.map(([category, amount]) => (
                    <div key={category}>
                      <Group justify="space-between" mb={6}>
                        <Text fw={600} c="white">{category}</Text>
                        <Text c="#DCE1DD">${amount.toFixed(2)}</Text>
                      </Group>
                      <Paper radius="xl" style={{ background: '#131313', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${Math.min((amount / (categoryRows[0][1] || 1)) * 100, 100)}%`,
                            height: 10,
                            background: 'linear-gradient(90deg, #6FE28C 0%, #B9F2C5 100%)',
                          }}
                        />
                      </Paper>
                    </div>
                  ))}
                </Stack>
              ) : (
                <Text c="#B5BAB7">No categories yet. Add a transaction to start shaping this view.</Text>
              )}
            </Paper>

            <Paper radius="xl" p="xl" style={{ background: '#1F1F1F', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Group justify="space-between" mb="md">
                <Title order={3} c="white">Transaction history</Title>
                {loading && <Loader color="green" size="sm" />}
              </Group>

              {transactions.length ? (
                <Table highlightOnHover horizontalSpacing="md" verticalSpacing="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Description</Table.Th>
                      <Table.Th>Category</Table.Th>
                      <Table.Th>Amount</Table.Th>
                      <Table.Th />
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {transactions.slice(0, 8).map((transaction) => (
                      <Table.Tr key={transaction.id}>
                        <Table.Td>
                          <Text c="white" fw={600}>{transaction.description}</Text>
                          <Text size="xs" c="#A5ADA8">{transaction.date}</Text>
                        </Table.Td>
                        <Table.Td><Text c="#DCE1DD">{transaction.category}</Text></Table.Td>
                        <Table.Td><Text c="#DCE1DD">${Number(transaction.amount).toFixed(2)}</Text></Table.Td>
                        <Table.Td>
                          <Button variant="subtle" color="red" size="compact-sm" onClick={() => handleDelete(transaction.id)}>
                            Delete
                          </Button>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              ) : (
                <Text c="#B5BAB7">No transactions yet. This panel will fill as soon as the first expense is saved.</Text>
              )}
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  )
}
