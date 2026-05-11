import { useEffect, useState } from 'react'
import { Box, Group, Paper, Text, Title, UnstyledButton } from '@mantine/core'

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

function calculateChange(current, previous) {
  if (previous <= 0) return 0
  return ((current - previous) / previous) * 100
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

function chartLabelIndexes(length) {
  if (length <= 7) return Array.from({ length }, (_, index) => index)
  if (length <= 30) return [0, 7, 14, 21, length - 1]
  if (length <= 90) return [0, 22, 44, 66, length - 1]
  return [0, 61, 122, 183, 244, 305, length - 1]
}

export default function InteractiveCashFlowCard({ charts, preview }) {
  const width = 620
  const height = 320
  const padding = 22
  const [selectedRange, setSelectedRange] = useState('1M')
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const chart = charts[selectedRange]
  const currentPoints = createLinePath(chart.currentSeries, width, height, padding)
  const previousPoints = createLinePath(chart.previousSeries, width, height, padding)
  const fallbackIndex = Math.max(0, currentPoints.length - 1)
  const activeIndex = hoveredIndex === null ? fallbackIndex : Math.min(Math.max(hoveredIndex, 0), fallbackIndex)
  const [markerX, markerY] = currentPoints[activeIndex]
  const markerValue = chart.currentSeries[activeIndex]
  const previousMarkerValue = chart.previousSeries[activeIndex] || 0
  const periodChange = calculateChange(chart.currentTotal, chart.previousTotal)

  useEffect(() => {
    setHoveredIndex(null)
  }, [selectedRange, charts])

  function handleChartMove(event) {
    const bounds = event.currentTarget.getBoundingClientRect()
    const offsetX = ((event.clientX - bounds.left) / bounds.width) * width
    const clamped = Math.min(Math.max(offsetX, padding), width - padding)
    const ratio = (clamped - padding) / Math.max(width - padding * 2, 1)
    const nextIndex = Math.round(ratio * Math.max(currentPoints.length - 1, 1))
    setHoveredIndex(nextIndex)
  }

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
            Last {chartRanges[selectedRange]} days - {preview ? 'preview data' : 'all accounts'}
          </Text>
        </div>

        <Group gap={8} wrap="nowrap">
          {Object.keys(chartRanges).map((tab) => (
            <UnstyledButton
              key={tab}
              onClick={() => setSelectedRange(tab)}
              style={{
                borderRadius: 999,
                padding: '6px 12px',
                background: tab === selectedRange ? '#F3F5F3' : 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Text style={{ fontSize: 12, color: tab === selectedRange ? '#111111' : '#767E79' }}>{tab}</Text>
            </UnstyledButton>
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
          {formatCurrency(chart.currentTotal)}
        </Text>
        <Text fw={700} style={{ fontSize: 16, color: '#66DD84' }}>
          {periodChange > 0 ? '+' : ''}{periodChange.toFixed(1)}%
        </Text>
        <Text style={{ fontSize: 14, color: '#78817B' }}>vs. previous period</Text>
      </Group>

      <Box style={{ position: 'relative', height: 380 }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height="100%"
          onMouseMove={handleChartMove}
          onMouseLeave={() => setHoveredIndex(null)}
          style={{ cursor: 'crosshair' }}
        >
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
          <line
            x1={markerX}
            x2={markerX}
            y1={padding}
            y2={height - padding}
            stroke="rgba(102, 221, 132, 0.25)"
            strokeDasharray="4 6"
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
          <Text size="xs" c="#7F8782">{chart.labels[activeIndex]}</Text>
          <Text fw={700} style={{ fontSize: 14, color: '#F4F7F4' }}>{shortCurrency(markerValue)} this period</Text>
          <Text size="xs" c="#8FA199">Previous period: {shortCurrency(previousMarkerValue)}</Text>
        </Paper>
      </Box>

      <Group justify="space-between" mt={10}>
        {chartLabelIndexes(chart.labels.length).map((index) => (
          <Text key={`${selectedRange}-${index}`} style={{ fontSize: 12, color: '#76807A' }}>{chart.labels[index]}</Text>
        ))}
      </Group>

      <Group gap={16} mt={12}>
        <Group gap={8}>
          <Box w={8} h={8} style={{ borderRadius: '50%', background: '#66DD84' }} />
          <Text style={{ fontSize: 13, color: '#92A197' }}>Current period</Text>
        </Group>
        <Group gap={8}>
          <Box w={8} h={8} style={{ borderRadius: '50%', background: 'rgba(231,231,231,0.45)' }} />
          <Text style={{ fontSize: 13, color: '#92A197' }}>Previous period</Text>
        </Group>
      </Group>
    </Paper>
  )
}
