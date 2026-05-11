import { useEffect, useRef, useState } from 'react'
import { Avatar, Button, Group, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { useAuth } from '../context/AuthContext'
import { svgMarkupToDataUri, userAvatarSrc } from '../lib/userMedia'

function SettingsCard({ title, eyebrow, children }) {
  return (
    <Paper radius={24} p="xl" style={{ background: '#1F1F1F', border: '1px solid rgba(255,255,255,0.05)' }}>
      <Stack gap={10}>
        {eyebrow ? (
          <Text tt="uppercase" style={{ fontSize: 11, letterSpacing: '0.12em', color: '#6F7872' }}>
            {eyebrow}
          </Text>
        ) : null}
        <Title order={3} c="#F2F4F2" style={{ fontSize: 24, letterSpacing: '-0.04em' }}>
          {title}
        </Title>
        {children}
      </Stack>
    </Paper>
  )
}

export default function Settings() {
  const { user, updateProfileImage } = useAuth()
  const fileInputRef = useRef(null)
  const [draftSvg, setDraftSvg] = useState(user?.profile_svg || '')
  const [selectedName, setSelectedName] = useState('')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setDraftSvg(user?.profile_svg || '')
  }, [user?.profile_svg])

  const createdAt = user?.created_at
    ? new Date(user.created_at.endsWith('Z') ? user.created_at : `${user.created_at}Z`).toLocaleString()
    : 'Not available'

  const currentAvatar = userAvatarSrc(user)
  const draftAvatar = svgMarkupToDataUri(draftSvg) || currentAvatar

  async function handleFileChange(event) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setError('')
    setStatus('')

    if (!file.name.toLowerCase().endsWith('.svg')) {
      setError('Please upload an SVG file for now.')
      return
    }

    if (file.size > 500_000) {
      setError('SVG files should stay under 500 KB.')
      return
    }

    const svgMarkup = (await file.text()).trim()

    if (!svgMarkup.toLowerCase().includes('<svg')) {
      setError('That file does not look like a valid SVG.')
      return
    }

    setDraftSvg(svgMarkup)
    setSelectedName(file.name)
    event.target.value = ''
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setStatus('')

    try {
      await updateProfileImage(draftSvg)
      setStatus('Profile image updated and stored in the local database as SVG.')
      setSelectedName('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove() {
    setSaving(true)
    setError('')
    setStatus('')

    try {
      await updateProfileImage('')
      setDraftSvg('')
      setSelectedName('')
      setStatus('Profile image removed.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Stack gap={22}>
      <div>
        <Text tt="uppercase" style={{ fontSize: 12, letterSpacing: '0.14em', color: '#727B75', marginBottom: 8 }}>
          Settings
        </Text>
        <Title order={1} style={{ fontSize: 40, lineHeight: 1, color: '#F2F4F2', fontWeight: 500, letterSpacing: '-0.06em' }}>
          Profile and account controls
        </Title>
        <Text c="#98A19B" mt={10} style={{ maxWidth: 700 }}>
          This is the first real account-management pass in React. Profile pictures now round-trip through the API and live in the local database as SVG markup.
        </Text>
      </div>

      <SimpleGrid cols={2} spacing={16}>
        <SettingsCard title="Profile image" eyebrow="Identity">
          <Group align="flex-start" gap={18} wrap="nowrap">
            <Avatar src={draftAvatar} size={92} radius="xl" />
            <Stack gap={8} style={{ flex: 1 }}>
              <Text c="#E7ECE8">Upload or swap your SVG avatar. The raw SVG markup is saved directly on your user record for now.</Text>
              <Text c="#7F8782" size="sm">
                {selectedName ? `Selected: ${selectedName}` : user?.profile_svg ? 'Using saved profile SVG.' : 'No custom SVG uploaded yet.'}
              </Text>
              <input
                ref={fileInputRef}
                type="file"
                accept=".svg,image/svg+xml"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <Group gap={10}>
                <Button color="green" radius="xl" onClick={() => fileInputRef.current?.click()}>
                  Choose SVG
                </Button>
                <Button variant="light" color="green" radius="xl" onClick={handleSave} loading={saving} disabled={!draftSvg}>
                  Save image
                </Button>
                <Button variant="subtle" color="gray" radius="xl" onClick={handleRemove} loading={saving} disabled={!user?.profile_svg && !draftSvg}>
                  Remove
                </Button>
              </Group>
              {status ? <Text c="#66DD84" size="sm">{status}</Text> : null}
              {error ? <Text c="#FF8F8F" size="sm">{error}</Text> : null}
            </Stack>
          </Group>
        </SettingsCard>

        <SettingsCard title="Account details" eyebrow="Account">
          <Text c="#E7ECE8"><strong>Username:</strong> {user?.username || 'Unknown'}</Text>
          <Text c="#E7ECE8"><strong>User ID:</strong> {user?.id || 'Unknown'}</Text>
          <Text c="#E7ECE8"><strong>Account created:</strong> {createdAt}</Text>
          <Text c="#7F8782" size="sm">JWT auth is already live in the React stack, so this page can keep growing into the real account surface.</Text>
        </SettingsCard>

        <SettingsCard title="AI migration notes" eyebrow="Backend reference">
          <Text c="#E7ECE8">The legacy backend already separates responsibilities cleanly:</Text>
          <Text c="#A9B0AB" size="sm">Claude powers Pluto chat responses from transaction and document context, while Gemini handles transaction-import PDFs and uploaded financial documents.</Text>
          <Text c="#A9B0AB" size="sm">That means the next React migration step can plug into those same API shapes instead of inventing a new flow.</Text>
        </SettingsCard>

        <SettingsCard title="Data scope" eyebrow="Privacy">
          <Text c="#E7ECE8">All transaction and profile requests remain scoped to the authenticated user before anything is rendered.</Text>
          <Text c="#A9B0AB" size="sm">That becomes especially important once Pluto, uploads, and document retention controls move fully into the React app.</Text>
        </SettingsCard>
      </SimpleGrid>
    </Stack>
  )
}
