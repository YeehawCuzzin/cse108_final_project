import { useEffect, useState } from 'react'
import { Button, Group, Image, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { Link } from 'react-router-dom'
import documentIcon from '../assets/icons/document.svg'
import { apiFetch } from '../lib/api'

function StatusCard({ label, value, hint }) {
  return (
    <Paper radius={20} p="lg" style={{ background: '#1F1F1F', border: '1px solid rgba(255,255,255,0.05)' }}>
      <Text c="#7f8a84" size="sm" fw={600}>{label}</Text>
      <Title order={2} c="white" mt={8} style={{ fontSize: 28, letterSpacing: '-0.05em' }}>{value}</Title>
      <Text c="#98A19B" mt={8} size="sm">{hint}</Text>
    </Paper>
  )
}

function UploadCard({
  eyebrow,
  title,
  description,
  accept,
  buttonLabel,
  file,
  onFileChange,
  onSubmit,
  loading,
  status,
  error,
  footnote,
}) {
  return (
    <Paper radius={24} p="xl" style={{ background: '#1F1F1F', border: '1px solid rgba(255,255,255,0.05)' }}>
      <Stack gap="md">
        <Text tt="uppercase" style={{ fontSize: 11, letterSpacing: '0.12em', color: '#6F7872' }}>
          {eyebrow}
        </Text>
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <div>
            <Title order={3} c="#F2F4F2" style={{ fontSize: 26, letterSpacing: '-0.05em' }}>{title}</Title>
            <Text c="#A7B0AA" mt={8} style={{ maxWidth: 440 }}>{description}</Text>
          </div>
          <Image src={documentIcon} alt="" w={72} h={72} />
        </Group>

        <Paper
          radius={18}
          p="lg"
          style={{
            background: '#171917',
            border: '1px dashed rgba(255,255,255,0.12)',
          }}
        >
          <Stack gap="sm">
            <Text c="#E7ECE8" fw={600}>{file ? file.name : 'Choose a file to upload'}</Text>
            <Text c="#7F8782" size="sm">
              {file ? `${(file.size / 1024).toFixed(1)} KB selected` : footnote}
            </Text>
            <input
              type="file"
              accept={accept}
              onChange={onFileChange}
              style={{ color: '#B5BAB7' }}
            />
          </Stack>
        </Paper>

        <Group justify="space-between" align="center">
          <div>
            {status ? <Text c="#66DD84" size="sm">{status}</Text> : null}
            {error ? <Text c="#FF8F8F" size="sm">{error}</Text> : null}
          </div>
          <Button color="green" radius="xl" loading={loading} disabled={!file} onClick={onSubmit}>
            {buttonLabel}
          </Button>
        </Group>
      </Stack>
    </Paper>
  )
}

export default function Imports() {
  const [transactionFile, setTransactionFile] = useState(null)
  const [contextFile, setContextFile] = useState(null)
  const [transactionLoading, setTransactionLoading] = useState(false)
  const [contextLoading, setContextLoading] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState('')
  const [transactionError, setTransactionError] = useState('')
  const [contextStatus, setContextStatus] = useState('')
  const [contextError, setContextError] = useState('')
  const [contextInfo, setContextInfo] = useState({
    has_context: false,
    preview: '',
    updated_at: null,
    total_characters: 0,
  })
  const [integrationStatus, setIntegrationStatus] = useState({
    backend_status: 'unknown',
    anthropic_configured: false,
    gemini_configured: false,
    has_context: false,
    transaction_count: 0,
  })
  const [recentImports, setRecentImports] = useState([])
  const [clearingContext, setClearingContext] = useState(false)

  async function loadContextInfo() {
    try {
      const data = await apiFetch('/api/uploads/context')
      setContextInfo(data)
    } catch (requestError) {
      setContextError(requestError.message)
    }
  }

  async function loadIntegrationStatus() {
    try {
      const data = await apiFetch('/api/uploads/status')
      setIntegrationStatus(data)
    } catch (requestError) {
      setContextError(requestError.message)
    }
  }

  useEffect(() => {
    loadContextInfo()
    loadIntegrationStatus()
  }, [])

  function handleTransactionFileChange(event) {
    setTransactionError('')
    setTransactionStatus('')
    setTransactionFile(event.currentTarget.files?.[0] || null)
  }

  function handleContextFileChange(event) {
    setContextError('')
    setContextStatus('')
    setContextFile(event.currentTarget.files?.[0] || null)
  }

  async function handleTransactionUpload() {
    if (!transactionFile) {
      return
    }

    const formData = new FormData()
    formData.append('file', transactionFile)

    setTransactionLoading(true)
    setTransactionError('')
    setTransactionStatus('')

    try {
      const data = await apiFetch('/api/uploads/transactions', {
        method: 'POST',
        body: formData,
      })
      setRecentImports(data.transactions || [])
      setTransactionStatus(`Imported ${data.imported} transactions from ${transactionFile.name}.`)
      setTransactionFile(null)
      await loadIntegrationStatus()
    } catch (requestError) {
      setTransactionError(requestError.message)
    } finally {
      setTransactionLoading(false)
    }
  }

  async function handleContextUpload() {
    if (!contextFile) {
      return
    }

    const formData = new FormData()
    formData.append('file', contextFile)

    setContextLoading(true)
    setContextError('')
    setContextStatus('')

    try {
      const data = await apiFetch('/api/uploads/context', {
        method: 'POST',
        body: formData,
      })
      setContextInfo(data)
      setContextStatus(`Uploaded ${contextFile.name} for Pluto context.`)
      setContextFile(null)
      await loadIntegrationStatus()
    } catch (requestError) {
      setContextError(requestError.message)
    } finally {
      setContextLoading(false)
    }
  }

  async function handleClearContext() {
    setClearingContext(true)
    setContextError('')
    setContextStatus('')

    try {
      const data = await apiFetch('/api/uploads/context', {
        method: 'DELETE',
      })
      setContextInfo(data)
      setContextStatus('Pluto document context cleared.')
      await loadIntegrationStatus()
    } catch (requestError) {
      setContextError(requestError.message)
    } finally {
      setClearingContext(false)
    }
  }

  const updatedLabel = contextInfo.updated_at
    ? new Date(contextInfo.updated_at.endsWith('Z') ? contextInfo.updated_at : `${contextInfo.updated_at}Z`).toLocaleString()
    : 'Nothing uploaded yet'

  return (
    <Stack gap={22}>
      <div>
        <Text c="#7f8a84" fw={600} mb={8}>Imports</Text>
        <Title order={1} c="white" style={{ letterSpacing: '-0.05em' }}>Document and statement intake</Title>
        <Text c="#B5BAB7" mt={8} style={{ maxWidth: 760 }}>
          This is the migration home for the upload flows that used to live only in the template app. Bring in transaction PDFs for parsing, or upload supporting documents so Pluto can answer with richer context.
        </Text>
      </div>

      <SimpleGrid cols={3} spacing="md">
        <StatusCard
          label="Pluto context"
          value={integrationStatus.has_context ? 'Loaded' : 'Empty'}
          hint={integrationStatus.has_context ? `${contextInfo.total_characters} characters stored for Claude prompts.` : 'No supporting financial documents uploaded yet.'}
        />
        <StatusCard
          label="Last document sync"
          value={updatedLabel}
          hint="Every uploaded document summary is appended to the user-scoped Pluto context."
        />
        <StatusCard
          label="Recent imported rows"
          value={`${integrationStatus.transaction_count}`}
          hint={recentImports.length ? 'Previewing the most recent Gemini-imported transactions below.' : 'This tracks total transactions currently stored in the backend for this account.'}
        />
      </SimpleGrid>

      <SimpleGrid cols={3} spacing="md">
        <StatusCard
          label="Backend"
          value={integrationStatus.backend_status.toUpperCase()}
          hint="This is reading the current Flask API health/status surface."
        />
        <StatusCard
          label="Claude"
          value={integrationStatus.anthropic_configured ? 'Ready' : 'Missing key'}
          hint="Pluto chat depends on the Anthropic API key being configured on the backend."
        />
        <StatusCard
          label="Gemini"
          value={integrationStatus.gemini_configured ? 'Ready' : 'Missing key'}
          hint="PDF import and Pluto document uploads depend on the Gemini API key."
        />
      </SimpleGrid>

      <SimpleGrid cols={2} spacing="lg">
        <UploadCard
          eyebrow="Transaction import"
          title="Import transactions from a PDF"
          description="Upload a bank statement or expense PDF and Gemini will extract debit transactions into your transaction feed."
          accept=".pdf,application/pdf"
          buttonLabel="Import PDF"
          file={transactionFile}
          onFileChange={handleTransactionFileChange}
          onSubmit={handleTransactionUpload}
          loading={transactionLoading}
          status={transactionStatus}
          error={transactionError}
          footnote="PDF only for now. Imported rows will appear in the Transactions page."
        />

        <UploadCard
          eyebrow="Pluto context"
          title="Upload documents for Pluto"
          description="Upload PDFs or text notes that Pluto should consider when answering questions about loans, aid letters, balances, subscriptions, or other financial context."
          accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
          buttonLabel="Upload for Pluto"
          file={contextFile}
          onFileChange={handleContextFileChange}
          onSubmit={handleContextUpload}
          loading={contextLoading}
          status={contextStatus}
          error={contextError}
          footnote="PDF, TXT, and MD files are supported in this first pass."
        />
      </SimpleGrid>

      <SimpleGrid cols={2} spacing="lg">
        <Paper radius={24} p="xl" style={{ background: '#1F1F1F', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Group justify="space-between" align="center" mb="md">
            <Title order={3} c="white" style={{ fontSize: 24, letterSpacing: '-0.04em' }}>Pluto context preview</Title>
            <Group gap="sm">
              <Button
                variant="subtle"
                color="red"
                radius="xl"
                onClick={handleClearContext}
                loading={clearingContext}
                disabled={!contextInfo.has_context}
              >
                Clear context
              </Button>
              <Button component={Link} to="/dashboard" variant="subtle" color="green" radius="xl">
                Open dashboard
              </Button>
            </Group>
          </Group>
          {contextInfo.has_context ? (
            <Text c="#D6DBD7" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>
              {contextInfo.preview}
            </Text>
          ) : (
            <Text c="#98A19B">
              Pluto does not have any uploaded document context yet. Once you upload a document, Gemini will summarize it here and Claude will start using it in chat replies.
            </Text>
          )}
        </Paper>

        <Paper radius={24} p="xl" style={{ background: '#1F1F1F', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Group justify="space-between" align="center" mb="md">
            <Title order={3} c="white" style={{ fontSize: 24, letterSpacing: '-0.04em' }}>Recent imported transactions</Title>
            <Button component={Link} to="/transactions" variant="subtle" color="green" radius="xl">
              View transactions
            </Button>
          </Group>
          {recentImports.length ? (
            <Stack gap="sm">
              {recentImports.map((transaction) => (
                <Paper key={transaction.id} radius={16} p="md" style={{ background: '#171917' }}>
                  <Group justify="space-between" align="flex-start">
                    <div>
                      <Text c="white" fw={600}>{transaction.description}</Text>
                      <Text c="#98A19B" size="sm">{transaction.date} - {transaction.category}</Text>
                    </div>
                    <Text c="#E7ECE8" fw={700}>${Number(transaction.amount || 0).toFixed(2)}</Text>
                  </Group>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Text c="#98A19B">
              Transaction imports are empty right now. After a PDF import succeeds, this pane will preview the rows Gemini just added to your account.
            </Text>
          )}
        </Paper>
      </SimpleGrid>
    </Stack>
  )
}
