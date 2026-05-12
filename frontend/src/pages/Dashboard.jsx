import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Group,
  Image,
  Modal,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
  UnstyledButton,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Link } from 'react-router-dom'
import InteractiveCashFlowCard from '../components/InteractiveCashFlowCard'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../lib/api'
import {
  placeholderPlusIcon,
  placeholderSearchIcon,
} from '../lib/placeholders'

const categoryColors = {
  Food: '#66DD84',
  Transport: '#FF7F8A',
  Housing: '#8CAEFF',
  Entertainment: '#FFB45B',
  Health: '#7FE2D2',
  Shopping: '#A985FF',
  Education: '#E7E7E7',
  Subscriptions: '#B184FF',
  Other: '#88918B',
}

const categories = ['Food', 'Transport', 'Housing', 'Entertainment', 'Health', 'Shopping', 'Education', 'Subscriptions', 'Other']
const chartRanges = {
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '1Y': 365,
}

function formatCurrency(amount) {
  return amount.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  })
}

function shortCurrency(amount) {
  return amount.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

function startOfDay(date) {
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)
  return value
}

function daysAgo(baseDate, days) {
  const value = new Date(baseDate)
  value.setDate(value.getDate() - days)
  return startOfDay(value)
}

function toKey(date) {
  return startOfDay(date).toISOString().slice(0, 10)
}


function sumTransactions(transactions) {
  return transactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0)
}

function calculateChange(current, previous) {
  if (previous <= 0) return 0
  return ((current - previous) / previous) * 100
}

function buildCashFlowSeries(transactions, days = 30) {
  const today = startOfDay(new Date())
  const currentRange = Array.from({ length: days }, (_, index) => daysAgo(today, days - 1 - index))
  const previousRange = Array.from({ length: days }, (_, index) => daysAgo(today, days * 2 - 1 - index))

  const byDay = {}
  transactions.forEach((transaction) => {
    const key = toKey(transaction.date)
    byDay[key] = (byDay[key] || 0) + Number(transaction.amount || 0)
  })

  const currentSeries = []
  const previousSeries = []
  let currentRunning = 0
  let previousRunning = 0

  currentRange.forEach((date) => {
    currentRunning += byDay[toKey(date)] || 0
    currentSeries.push(currentRunning)
  })

  previousRange.forEach((date) => {
    previousRunning += byDay[toKey(date)] || 0
    previousSeries.push(previousRunning)
  })

  return {
    currentSeries,
    previousSeries,
    currentTotal: currentRunning,
    previousTotal: previousRunning,
    labels: currentRange.map((date) => date.toLocaleDateString(undefined, {
      month: 'short',
      day: days > 120 ? undefined : 'numeric',
    })),
  }
}

function chartLabelIndexes(length) {
  if (length <= 7) return Array.from({ length }, (_, index) => index)
  if (length <= 30) return [0, 7, 14, 21, length - 1]
  if (length <= 90) return [0, 22, 44, 66, length - 1]
  return [0, 61, 122, 183, 244, 305, length - 1]
}

function createLinePath(values, width, height, padding) {
  const max = Math.max(...values, 1)
  const innerWidth = width - padding * 2
  const innerHeight = height - padding * 2

  return values.map((value, index) => {
    const x = padding + (index / Math.max(values.length - 1, 1)) * innerWidth
    const y = padding + innerHeight - (value / max) * innerHeight
    return [x, y]
  })
}

function pointsToPath(points) {
  return points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ')
}

function pointsToArea(points, width, height, padding) {
  if (!points.length) return ''
  const first = points[0]
  const last = points[points.length - 1]
  return `${pointsToPath(points)} L ${last[0]} ${height - padding} L ${first[0]} ${height - padding} Z`
}

function relativeDate(dateString) {
  const date = startOfDay(new Date(dateString))
  const today = startOfDay(new Date())
  const diff = Math.round((today.getTime() - date.getTime()) / 86400000)

  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function initialsFor(description) {
  return description
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function emptyTransactionForm() {
  return {
    description: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().slice(0, 10),
  }
}

function StatCard({ label, value, delta, sparkBars, accent = '#66DD84', inverse = false }) {
  return (
    <Paper
      radius={18}
      px={18}
      py={14}
      style={{
        background: '#1F1F1F',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        minHeight: 104,
      }}
    >
      <Group justify="space-between" align="flex-start" mb={10}>
        <Text style={{ fontSize: 13, color: '#828A85', letterSpacing: '-0.02em' }}>{label}</Text>
        {delta !== null ? (
          <Paper
            radius={999}
            px={10}
            py={4}
            style={{
              background: inverse ? 'rgba(102, 221, 132, 0.12)' : 'rgba(92, 38, 38, 0.35)',
            }}
          >
            <Text
              fw={700}
              style={{
                fontSize: 12,
                color: inverse ? '#66DD84' : '#FF7F8A',
                letterSpacing: '-0.03em',
              }}
            >
              {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
            </Text>
          </Paper>
        ) : null}
      </Group>

      <Text
        fw={700}
        style={{
          fontSize: 24,
          lineHeight: 1,
          color: '#F2F4F2',
          letterSpacing: '-0.05em',
          marginBottom: 16,
        }}
      >
        {value}
      </Text>

      <Group gap={4} align="flex-end" wrap="nowrap">
        {sparkBars.map((bar, index) => (
          <div
            key={`${label}-${index}`}
            style={{
              width: 6,
              height: `${bar}px`,
              borderRadius: 999,
              background: index === sparkBars.length - 1 ? accent : 'rgba(231, 231, 231, 0.22)',
            }}
          />
        ))}
      </Group>
    </Paper>
  )
}

function ChartCard({ total, monthChange, chart, preview }) {
  const width = 620
  const height = 320
  const padding = 22
  const currentPoints = createLinePath(chart.currentSeries, width, height, padding)
  const previousPoints = createLinePath(chart.previousSeries, width, height, padding)
  const markerIndex = Math.max(0, Math.floor(currentPoints.length * 0.76))
  const [markerX, markerY] = currentPoints[markerIndex]
  const markerValue = chart.currentSeries[markerIndex]

  return (
    <Paper
      radius={24}
      px={22}
      py={20}
      style={{
        background: '#1F1F1F',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        minHeight: 580,
      }}
    >
      <Group justify="space-between" align="flex-start" mb={22}>
        <div>
          <Title order={3} style={{ fontSize: 20, lineHeight: 1.1, color: '#F3F5F3', letterSpacing: '-0.04em' }}>
            Cash flow
          </Title>
          <Text style={{ fontSize: 13, color: '#77807A' }}>
            Last 30 days · {preview ? 'preview data' : 'all accounts'}
          </Text>
        </div>

        <Group gap={8} wrap="nowrap">
          {['1W', '1M', '3M', '1Y'].map((tab) => (
            <Paper
              key={tab}
              radius={999}
              px={12}
              py={6}
              style={{
                background: tab === '1M' ? '#F3F5F3' : 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Text style={{ fontSize: 12, color: tab === '1M' ? '#111111' : '#767E79' }}>{tab}</Text>
            </Paper>
          ))}
        </Group>
      </Group>

      <Group gap={12} align="flex-end" mb={18}>
        <Text
          fw={700}
          style={{
            fontSize: 38,
            lineHeight: 1,
            color: '#F5F7F5',
            letterSpacing: '-0.05em',
          }}
        >
          {formatCurrency(total)}
        </Text>
        <Text fw={700} style={{ fontSize: 16, color: '#66DD84' }}>
          ▲ {monthChange > 0 ? '+' : ''}{monthChange.toFixed(1)}%
        </Text>
        <Text style={{ fontSize: 14, color: '#78817B' }}>vs. last month</Text>
      </Group>

      <Box style={{ position: 'relative', height: 380 }}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
          {[0.25, 0.5, 0.75].map((ratio) => (
            <line
              key={ratio}
              x1={padding}
              x2={width - padding}
              y1={padding + (height - padding * 2) * ratio}
              y2={padding + (height - padding * 2) * ratio}
              stroke="rgba(255,255,255,0.08)"
              strokeDasharray="2 6"
            />
          ))}

          <path d={pointsToArea(currentPoints, width, height, padding)} fill="rgba(102, 221, 132, 0.18)" />
          <path
            d={pointsToPath(previousPoints)}
            fill="none"
            stroke="rgba(231,231,231,0.35)"
            strokeWidth="3"
            strokeDasharray="4 5"
          />
          <path
            d={pointsToPath(currentPoints)}
            fill="none"
            stroke="#66DD84"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <circle cx={markerX} cy={markerY} r="7" fill="#66DD84" />
          <circle cx={markerX} cy={markerY} r="16" fill="rgba(102,221,132,0.16)" />
        </svg>

        <Paper
          radius={10}
          px={12}
          py={9}
          style={{
            position: 'absolute',
            left: `${(markerX / width) * 100 - 5}%`,
            top: `${(markerY / height) * 100 - 18}%`,
            background: '#202322',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <Text size="xs" c="#7F8782">{chart.labels[markerIndex]}</Text>
          <Text fw={700} style={{ fontSize: 14, color: '#F4F7F4' }}>{shortCurrency(markerValue)} spent</Text>
        </Paper>
      </Box>

      <Group justify="space-between" mt={10}>
        {chart.labels.filter((_, index) => index % 7 === 0 || index === chart.labels.length - 1).map((label) => (
          <Text key={label} style={{ fontSize: 12, color: '#76807A' }}>{label}</Text>
        ))}
      </Group>

      <Group gap={16} mt={12}>
        <Group gap={8}>
          <Box w={8} h={8} style={{ borderRadius: '50%', background: '#66DD84' }} />
          <Text style={{ fontSize: 13, color: '#92A197' }}>This month</Text>
        </Group>
        <Group gap={8}>
          <Box w={8} h={8} style={{ borderRadius: '50%', background: 'rgba(231,231,231,0.45)' }} />
          <Text style={{ fontSize: 13, color: '#92A197' }}>Last month</Text>
        </Group>
      </Group>
    </Paper>
  )
}

function CategoryCard({ rows, totalSpent }) {
  const topMover = rows[0]

  return (
    <Paper
      radius={24}
      px={22}
      py={20}
      style={{
        background: '#1F1F1F',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        minHeight: 365,
      }}
    >
      <Group justify="space-between" align="flex-start" mb={16}>
        <div>
          <Title order={3} style={{ fontSize: 20, lineHeight: 1.1, color: '#F3F5F3', letterSpacing: '-0.04em' }}>
            Spending by category
          </Title>
          <Text style={{ fontSize: 13, color: '#77807A' }}>{rows.length} categories</Text>
        </div>

        <Paper radius={999} px={12} py={6} style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'transparent' }}>
          <Text style={{ fontSize: 12, color: '#7C847F' }}>Manage</Text>
        </Paper>
      </Group>

      <Stack gap={16}>
        {rows.map((row) => (
          <div key={row.category}>
            <Group justify="space-between" mb={8}>
              <Group gap={10}>
                <Box w={9} h={9} style={{ borderRadius: 2, background: row.color }} />
                <Text style={{ fontSize: 15, color: '#F2F4F2', letterSpacing: '-0.03em' }}>{row.category}</Text>
              </Group>
              <Text fw={700} style={{ fontSize: 15, color: '#F2F4F2', letterSpacing: '-0.03em' }}>
                {formatCurrency(row.amount)}
              </Text>
            </Group>

            <div
              style={{
                height: 5,
                borderRadius: 999,
                background: 'rgba(255,255,255,0.05)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.max(row.amount / Math.max(rows[0]?.amount || 1, 1) * 100, 12)}%`,
                  height: '100%',
                  borderRadius: 999,
                  background: row.color,
                }}
              />
            </div>
          </div>
        ))}
      </Stack>

      <Group justify="space-between" mt={30} pt={14} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Text style={{ fontSize: 13, color: '#77807A' }}>Top mover</Text>
        <Text fw={700} style={{ fontSize: 14, color: '#F2F4F2', letterSpacing: '-0.03em' }}>
          {topMover?.category || 'N/A'} · {topMover ? `${Math.round((topMover.amount / Math.max(totalSpent, 1)) * 100)}%` : '0%'}
        </Text>
      </Group>
    </Paper>
  )
}

function RecentTransactionsCard({ transactions, onDelete }) {
  return (
    <Paper
      radius={24}
      px={22}
      py={20}
      style={{
        background: '#1F1F1F',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        minHeight: 318,
      }}
    >
      <Group justify="space-between" align="flex-start" mb={16}>
        <div>
          <Title order={3} style={{ fontSize: 20, lineHeight: 1.1, color: '#F3F5F3', letterSpacing: '-0.04em' }}>
            Recent transactions
          </Title>
          <Text style={{ fontSize: 13, color: '#77807A' }}>Live from your backend feed</Text>
        </div>

        <Paper
          component={Link}
          to="/transactions"
          radius={999}
          px={12}
          py={6}
          style={{
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'transparent',
            textDecoration: 'none',
          }}
        >
          <Text style={{ fontSize: 12, color: '#7C847F' }}>View all</Text>
        </Paper>
      </Group>

      <Stack gap={6}>
        {transactions.map((transaction) => (
          <Group
            key={transaction.id}
            justify="space-between"
            px={4}
            py={10}
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            <Group gap={12}>
              <Paper
                radius={10}
                w={28}
                h={28}
                style={{
                  background: `${categoryColors[transaction.category] || '#6F7872'}20`,
                  display: 'grid',
                  placeItems: 'center',
                  color: categoryColors[transaction.category] || '#D7DDD9',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {initialsFor(transaction.description)}
              </Paper>
              <div>
                <Text fw={600} style={{ fontSize: 14, color: '#F2F4F2', letterSpacing: '-0.03em' }}>
                  {transaction.description}
                </Text>
                <Text size="xs" c="#727B76">
                  {relativeDate(transaction.date)} · {transaction.category}
                </Text>
              </div>
            </Group>

            <Group gap={10} wrap="nowrap">
              <Text
                fw={700}
                style={{
                  fontSize: 14,
                  color: '#E7ECE8',
                  letterSpacing: '-0.03em',
                }}
              >
                -{formatCurrency(Number(transaction.amount || 0))}
              </Text>
              {typeof transaction.id === 'number' ? (
                <UnstyledButton onClick={() => onDelete(transaction.id)}>
                  <Text size="xs" c="#7C847F">Delete</Text>
                </UnstyledButton>
              ) : null}
            </Group>
          </Group>
        ))}
      </Stack>
    </Paper>
  )
}

function QuickAddModal({ opened, onClose, onSubmit, saving, error }) {
  const [form, setForm] = useState(emptyTransactionForm())

  useEffect(() => {
    if (opened) {
      setForm(emptyTransactionForm())
    }
  }, [opened])

  async function handleSubmit(event) {
    event.preventDefault()
    await onSubmit({
      ...form,
      amount: Number(form.amount),
    })
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Add transaction"
      centered
      radius={20}
      styles={{
        content: {
          background: '#171A17',
          color: '#E7ECE8',
          border: '1px solid rgba(255,255,255,0.06)',
        },
        header: {
          background: '#171A17',
        },
        title: {
          fontSize: 20,
          fontWeight: 600,
          letterSpacing: '-0.04em',
        },
      }}
    >
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
          {error ? <Text c="#ff8d8d" size="sm">{error}</Text> : null}
          <Group justify="flex-end">
            <Button variant="subtle" color="gray" onClick={onClose}>Cancel</Button>
            <Button type="submit" color="green" loading={saving}>Save</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchValue, setSearchValue] = useState('')
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadTransactions() {
    const data = await apiFetch('/api/transactions')
    setTransactions(data.transactions || [])
  }

  useEffect(() => {
    let active = true

    async function bootstrap() {
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

    bootstrap()

    return () => {
      active = false
    }
  }, [])

  const derived = useMemo(() => {
    const query = searchValue.trim().toLowerCase()
    const source = query
      ? transactions.filter((transaction) => {
          const haystack = `${transaction.description} ${transaction.category} ${transaction.date}`.toLowerCase()
          return haystack.includes(query)
        })
      : transactions

    const today = startOfDay(new Date())
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)

    const thisMonthTransactions = source.filter((transaction) => startOfDay(new Date(transaction.date)) >= monthStart)
    const lastMonthTransactions = source.filter((transaction) => {
      const date = startOfDay(new Date(transaction.date))
      return date >= lastMonthStart && date <= lastMonthEnd
    })

    const totalSpent = sumTransactions(source)
    const thisMonth = sumTransactions(thisMonthTransactions)
    const lastMonth = sumTransactions(lastMonthTransactions)
    const transactionsChange = calculateChange(thisMonthTransactions.length, Math.max(lastMonthTransactions.length, 1))

    const categoryTotals = {}
    source.forEach((transaction) => {
      categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + Number(transaction.amount || 0)
    })

    const categoryRows = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        color: categoryColors[category] || '#8A938D',
      }))
      .sort((left, right) => right.amount - left.amount)
      .slice(0, 5)

    const sparkSource = buildCashFlowSeries(source, 30).currentSeries.slice(-8)
    const maxSpark = Math.max(...sparkSource, 1)
    const sparkBars = sparkSource.map((value) => Math.max(Math.round((value / maxSpark) * 18), 6))

    return {
      totalSpent,
      thisMonth,
      totalChange: calculateChange(thisMonth, lastMonth),
      thisMonthChange: calculateChange(thisMonth, lastMonth),
      transactionsCount: source.length,
      transactionsChange,
      topCategory: categoryRows[0]?.category || 'None yet',
      topCategoryShare: categoryRows[0] ? Math.round((categoryRows[0].amount / Math.max(totalSpent, 1)) * 100) : 0,
      sparkBars,
      charts: Object.fromEntries(
        Object.entries(chartRanges).map(([key, days]) => [key, buildCashFlowSeries(source, days)])
      ),
      categoryRows,
      recentTransactions: [...source]
        .sort((left, right) => new Date(right.date) - new Date(left.date))
        .slice(0, 4),
    }
  }, [transactions, searchValue])

  async function handleCreateTransaction(form) {
    setSaving(true)
    setError('')

    try {
      await apiFetch('/api/transactions', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      await loadTransactions()
      closeModal()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteTransaction(id) {
    setError('')

    try {
      await apiFetch(`/api/transactions/${id}`, { method: 'DELETE' })
      await loadTransactions()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const displayName = (user?.username || 'dev').toUpperCase()

  if (loading) {
    return (
      <Paper radius={24} p={30} style={{ background: '#151715', minHeight: 320 }}>
        <Text c="#E7ECE8">Loading dashboard...</Text>
      </Paper>
    )
  }

  return (
    <>
      <Stack gap={22}>
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <div>
            <Text
              tt="uppercase"
              style={{
                fontSize: 12,
                letterSpacing: '0.14em',
                color: '#727B75',
                marginBottom: 8,
              }}
            >
              Welcome back, {displayName}
            </Text>
            <Title
              order={1}
              style={{
                fontSize: 42,
                lineHeight: 1,
                color: '#F2F4F2',
                fontWeight: 500,
                letterSpacing: '-0.06em',
              }}
            >
              Here&apos;s your{' '}
              <Text span c="#66DD84" inherit fs="italic" fw={500}>
                financial overview
              </Text>
            </Title>
          </div>

          <Group gap={12} wrap="nowrap" mt={8}>
            <Paper
              radius={999}
              px={16}
              py={10}
              style={{
                minWidth: 320,
                background: '#1C1E1C',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <Group justify="space-between" wrap="nowrap">
                <Group gap={10} wrap="nowrap" style={{ flex: 1 }}>
                  <Image src={placeholderSearchIcon} alt="" w={16} h={16} />
                  <input
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="Search merchants, categories..."
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: '#E7ECE8',
                      fontSize: 13,
                      fontFamily: 'inherit',
                    }}
                  />
                </Group>
                <Paper radius={999} px={8} py={2} style={{ background: '#202422' }}>
                  <Text size="xs" c="#7F8782">⌘K</Text>
                </Paper>
              </Group>
            </Paper>

            <UnstyledButton
              onClick={openModal}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#1C1E1C',
                border: '1px solid rgba(255,255,255,0.07)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Image src={placeholderPlusIcon} alt="" w={16} h={16} />
            </UnstyledButton>
          </Group>
        </Group>

        {error ? (
          <Paper radius={16} px={14} py={10} style={{ background: 'rgba(120, 32, 32, 0.22)', border: '1px solid rgba(255, 128, 128, 0.16)' }}>
            <Text style={{ fontSize: 13, color: '#FF9898' }}>{error}</Text>
          </Paper>
        ) : null}

        <SimpleGrid cols={4} spacing={14}>
          <StatCard
            label="Total Spent"
            value={formatCurrency(derived.totalSpent)}
            delta={derived.totalChange}
            sparkBars={derived.sparkBars}
            inverse={false}
          />
          <StatCard
            label="This Month"
            value={formatCurrency(derived.thisMonth)}
            delta={derived.thisMonthChange}
            sparkBars={[8, 10, 12, 14, 12, 13, 15, 18]}
            inverse
          />
          <StatCard
            label="Transactions"
            value={`${derived.transactionsCount}`}
            delta={derived.transactionsChange}
            sparkBars={[6, 7, 7, 8, 8, 9, 10, 11]}
            inverse
          />
          <StatCard
            label="Top Category"
            value={derived.topCategory}
            delta={derived.topCategoryShare}
            sparkBars={[5, 6, 8, 9, 10, 12, 14, 16]}
            inverse
          />
        </SimpleGrid>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr',
            gap: 14,
            alignItems: 'start',
          }}
        >
          <InteractiveCashFlowCard charts={derived.charts} preview={false} />

          <Stack gap={14}>
            <CategoryCard rows={derived.categoryRows} totalSpent={derived.totalSpent} />
            <RecentTransactionsCard transactions={derived.recentTransactions} onDelete={handleDeleteTransaction} />
          </Stack>
        </div>
      </Stack>

      <QuickAddModal
        opened={modalOpened}
        onClose={closeModal}
        onSubmit={handleCreateTransaction}
        saving={saving}
        error={error}
      />
    </>
  )
}
