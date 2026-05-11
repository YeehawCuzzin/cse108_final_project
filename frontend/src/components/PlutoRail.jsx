import { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Group, Image, Paper, ScrollArea, Stack, Text, TextInput, UnstyledButton } from '@mantine/core'
import attachIcon from '../assets/icons/attach.svg'
import arrowIcon from '../assets/icons/arrow.svg'
import { placeholderOrbit } from '../lib/placeholders'
import { apiFetch } from '../lib/api'

const suggestionChips = [
  'What did I spend the most on this month?',
  'Show my recurring subscriptions',
  'How could I trim dining costs?',
]

function createIntroMessage(displayName) {
  return {
    id: `intro-${displayName}`,
    role: 'assistant',
    content: `Morning, ${displayName}. Pluto is now live on the React side. Ask me about your spending, categories, or transaction trends and I’ll answer from your current transaction history.`,
  }
}

function renderInline(text) {
  return text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part
  )
}

function MarkdownContent({ content, color }) {
  const textStyle = { fontSize: 15, lineHeight: 1.45, color, letterSpacing: '-0.03em', margin: 0 }
  const paragraphs = content.trim().split(/\n{2,}/)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {paragraphs.map((para, pi) => {
        const lines = para.split('\n').filter((l) => l.trim())
        const isBulletList = lines.some((l) => /^[-*]\s/.test(l.trim()))

        if (isBulletList) {
          return (
            <ul key={pi} style={{ paddingLeft: 18, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {lines.map((line, li) => (
                <li key={li} style={textStyle}>
                  {renderInline(line.trim().replace(/^[-*]\s/, ''))}
                </li>
              ))}
            </ul>
          )
        }

        return (
          <p key={pi} style={textStyle}>
            {renderInline(para)}
          </p>
        )
      })}
    </div>
  )
}

function Bubble({ role, content }) {
  const isUser = role === 'user'
  const textColor = isUser ? '#0F1911' : '#E7ECE8'

  return (
    <div style={{ alignSelf: isUser ? 'flex-end' : 'flex-start' }}>
      {!isUser ? <Text size="xs" c="#6F8B74" mb={8}>PLUTO</Text> : null}
      <Paper
        radius={16}
        px={14}
        py={12}
        style={{
          maxWidth: 300,
          background: isUser ? '#67DA83' : 'rgba(15, 26, 16, 0.82)',
          border: isUser ? '1px solid rgba(103, 218, 131, 0.24)' : '1px solid rgba(101, 160, 114, 0.12)',
        }}
      >
        {isUser
          ? <Text style={{ fontSize: 15, lineHeight: 1.38, color: textColor, letterSpacing: '-0.03em' }}>{content}</Text>
          : <MarkdownContent content={content} color={textColor} />
        }
      </Paper>
      {isUser ? <Text size="xs" c="#8AA392" ta="right" mt={6}>YOU</Text> : null}
    </div>
  )
}

export default function PlutoRail({ displayName }) {
  const [messages, setMessages] = useState(() => [createIntroMessage(displayName)])
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    setMessages((current) => {
      if (current.length > 1) {
        return current
      }
      return [createIntroMessage(displayName)]
    })
  }, [displayName])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [messages, loading])

  const history = useMemo(
    () => messages
      .filter((message) => message.role === 'user' || message.role === 'assistant')
      .map(({ role, content }) => ({ role, content }))
      .slice(-10),
    [messages]
  )

  async function sendMessage(nextMessage) {
    const content = nextMessage.trim()
    if (!content || loading) {
      return
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
    }

    setDraft('')
    setError('')
    setMessages((current) => [...current, userMessage])
    setLoading(true)

    try {
      const data = await apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: content,
          history,
        }),
      })

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
        },
      ])
    } catch (requestError) {
      const fallback = `I couldn't answer just now. ${requestError.message}`
      setError(requestError.message)
      setMessages((current) => [
        ...current,
        {
          id: `assistant-error-${Date.now()}`,
          role: 'assistant',
          content: fallback,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    sendMessage(draft)
  }

  return (
    <Paper
      radius={0}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: '#102515',
        borderLeft: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <Image
        src={placeholderOrbit}
        alt=""
        pos="absolute"
        top={0}
        left={0}
        w="100%"
        h="100%"
        style={{ objectFit: 'cover', opacity: 0.92 }}
      />

      <Box
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(38, 82, 49, 0.46) 0%, rgba(15, 27, 17, 0.34) 100%)',
        }}
      />

      <Box
        px={24}
        pt={22}
        pb={22}
        style={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Group gap={12} wrap="nowrap" mb={26}>
          <Paper
            radius={14}
            w={38}
            h={38}
            style={{
              background: '#67DA83',
              display: 'grid',
              placeItems: 'center',
              color: '#102515',
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            P
          </Paper>
          <div>
            <Text fw={700} style={{ fontSize: 16, color: '#F0F3F1', letterSpacing: '-0.03em' }}>Pluto</Text>
            <Text size="xs" c="#8AA392">ONLINE - CLAUDE + TRANSACTIONS</Text>
          </div>
        </Group>

        <ScrollArea flex={1} type="never">
          <Stack gap={18} pr={8}>
            {messages.map((message) => (
              <Bubble key={message.id} role={message.role} content={message.content} />
            ))}

            {loading ? (
              <div>
                <Text size="xs" c="#6F8B74" mb={8}>PLUTO</Text>
                <Paper
                  radius={16}
                  px={14}
                  py={12}
                  style={{
                    maxWidth: 180,
                    background: 'rgba(15, 26, 16, 0.82)',
                    border: '1px solid rgba(101, 160, 114, 0.12)',
                  }}
                >
                  <Text style={{ fontSize: 15, lineHeight: 1.35, color: '#E7ECE8', letterSpacing: '-0.03em' }}>
                    Thinking...
                  </Text>
                </Paper>
              </div>
            ) : null}

            <div ref={bottomRef} />
          </Stack>
        </ScrollArea>

        <Stack gap={10} mt={16}>
          <Group gap={8} wrap="wrap">
            {suggestionChips.map((chip) => (
              <UnstyledButton key={chip} onClick={() => sendMessage(chip)} disabled={loading}>
                <Paper
                  radius={999}
                  px={14}
                  py={8}
                  style={{
                    background: 'rgba(11, 21, 14, 0.55)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  <Text style={{ fontSize: 13, color: '#F1F4F2', letterSpacing: '-0.03em' }}>{chip}</Text>
                </Paper>
              </UnstyledButton>
            ))}
          </Group>

          {error ? <Text size="xs" c="#FF9D9D">{error}</Text> : null}

          <Paper
            component="form"
            onSubmit={handleSubmit}
            radius={16}
            px={14}
            py={12}
            style={{
              background: 'rgba(11, 21, 14, 0.55)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Group gap={12} wrap="nowrap">
              <Box style={{ flex: 1 }}>
                <TextInput
                  value={draft}
                  onChange={(event) => setDraft(event.currentTarget.value)}
                  placeholder="Ask Pluto about your money..."
                  disabled={loading}
                  styles={{
                    input: {
                      height: 26,
                      padding: 0,
                      border: 'none',
                      background: 'transparent',
                      boxShadow: 'none',
                      color: '#E7ECE8',
                      fontSize: 14,
                    },
                  }}
                />
              </Box>
              <UnstyledButton disabled>
                <Image src={attachIcon} alt="" w={18} h={18} style={{ opacity: 0.5 }} />
              </UnstyledButton>
              <UnstyledButton
                type="submit"
                disabled={loading || !draft.trim()}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 10,
                  background: '#67DA83',
                  display: 'grid',
                  placeItems: 'center',
                  opacity: loading || !draft.trim() ? 0.55 : 1,
                }}
              >
                <Image src={arrowIcon} alt="" w={16} h={16} />
              </UnstyledButton>
            </Group>
          </Paper>
        </Stack>
      </Box>
    </Paper>
  )
}
