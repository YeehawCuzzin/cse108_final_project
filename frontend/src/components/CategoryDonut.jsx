import { Box, Group, Stack, Text } from '@mantine/core'

export default function CategoryDonut({ categoryTotals }) {
  const categories = Object.entries(categoryTotals)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)

  const total = categories.reduce((sum, [, amount]) => sum + amount, 0)

  if (!categories.length) {
    return (
      <Stack justify="center" align="center" h={232} gap={10}>
        <Text style={{ fontSize: 16, color: '#E7E7E7', lineHeight: 1.15, letterSpacing: '-0.04em' }}>
          No category data yet.
        </Text>
        <Text
          ta="center"
          style={{
            fontSize: 13,
            color: '#4E4E4E',
            lineHeight: 1.24,
            letterSpacing: '-0.03em',
            maxWidth: 220,
          }}
        >
          Add transactions from the Expenses page to populate this chart.
        </Text>
      </Stack>
    )
  }

  const chartColors = ['#6FE28C', '#A2F2B5', '#4FB56C', '#F1F3F5', '#2C5C38']
  let currentStop = 0
  const segments = categories.map(([, amount], index) => {
    const start = currentStop
    const share = (amount / total) * 100
    currentStop += share
    return `${chartColors[index]} ${start}% ${currentStop}%`
  })

  return (
    <Group align="center" justify="space-between" wrap="nowrap" gap={30}>
      <Box
        style={{
          width: 176,
          height: 176,
          borderRadius: '50%',
          background: `conic-gradient(${segments.join(', ')})`,
          display: 'grid',
          placeItems: 'center',
          boxShadow: '0 18px 44px rgba(0, 0, 0, 0.26)',
          flexShrink: 0,
        }}
      >
        <Box
          style={{
            width: 104,
            height: 104,
            borderRadius: '50%',
            background: 'rgba(15, 15, 15, 0.96)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'grid',
            placeItems: 'center',
            textAlign: 'center',
            padding: 18,
          }}
        >
          <div>
            <Text
              style={{
                fontSize: 11,
                color: '#4E4E4E',
                lineHeight: 1,
                textTransform: 'uppercase',
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Tracked
            </Text>
            <Text style={{ fontSize: 17, color: '#E7E7E7', lineHeight: 1, fontWeight: 500, letterSpacing: '-0.04em' }}>
              ${total.toFixed(2)}
            </Text>
          </div>
        </Box>
      </Box>

      <Stack gap={12} flex={1}>
        {categories.map(([category, amount], index) => (
          <Group key={category} justify="space-between" gap="md" wrap="nowrap">
            <Group gap="sm" wrap="nowrap">
              <Box
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: chartColors[index],
                  boxShadow: `0 0 0 4px ${chartColors[index]}20`,
                }}
              />
              <Text style={{ fontSize: 14, color: '#E7E7E7', lineHeight: 1.1, fontWeight: 500, letterSpacing: '-0.03em' }}>
                {category}
              </Text>
            </Group>
            <Text style={{ fontSize: 14, color: '#E7E7E7', lineHeight: 1.1, fontWeight: 500, letterSpacing: '-0.03em' }}>
              ${amount.toFixed(2)}
            </Text>
          </Group>
        ))}
      </Stack>
    </Group>
  )
}
