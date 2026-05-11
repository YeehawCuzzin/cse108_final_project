import { Avatar, Box, Group, Image, Paper, ScrollArea, Stack, Text, UnstyledButton } from '@mantine/core'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import flowfundLogo from '../assets/flowfund.svg'
import dashboardIcon from '../assets/icons/dashboard.svg'
import documentIcon from '../assets/icons/document.svg'
import expensesIcon from '../assets/icons/expenses.svg'
import settingsIcon from '../assets/icons/settings.svg'
import PlutoRail from './PlutoRail'
import { useAuth } from '../context/AuthContext'
import {
  placeholderWorkspaceIcon,
} from '../lib/placeholders'
import { userAvatarSrc } from '../lib/userMedia'

const navSections = [
  {
    label: 'Workspace',
    items: [
      { label: 'Dashboard', to: '/dashboard', icon: dashboardIcon },
      { label: 'Transactions', to: '/transactions', icon: expensesIcon },
      { label: 'Imports', to: '/imports', icon: documentIcon },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Settings', to: '/settings', icon: settingsIcon },
    ],
  },
]

function NavItem({ item }) {
  return (
    <NavLink to={item.to} style={{ textDecoration: 'none' }}>
      {({ isActive }) => (
        <Group
          justify="flex-start"
          wrap="nowrap"
          px={16}
          py={12}
          style={{
            borderRadius: 12,
            background: isActive ? 'linear-gradient(180deg, rgba(43, 99, 57, 0.55) 0%, rgba(24, 58, 34, 0.85) 100%)' : 'transparent',
            border: isActive ? '1px solid rgba(75, 154, 95, 0.26)' : '1px solid transparent',
            color: isActive ? '#6FE28C' : '#E7E7E7',
          }}
        >
          <Group gap={12} wrap="nowrap">
            <Image src={item.icon} alt="" w={18} h={18} />
            <Text
              fw={isActive ? 500 : 400}
              style={{
                fontSize: 16,
                lineHeight: 1.15,
                color: isActive ? '#6FE28C' : '#E7E7E7',
                letterSpacing: '-0.03em',
              }}
            >
              {item.label}
            </Text>
          </Group>
        </Group>
      )}
    </NavLink>
  )
}

export default function ProtectedLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const displayName = user?.username || 'dev'
  const avatarSrc = userAvatarSrc(user)

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <Box style={{ minHeight: '100vh', background: '#0D0F0D' }}>
      <Box
        style={{
          height: '100vh',
          display: 'grid',
          gridTemplateColumns: '260px minmax(0, 1fr) 390px',
          background: '#0D0F0D',
        }}
      >
        <Paper
          radius={0}
          px={18}
          py={28}
          style={{
            background: '#0D0F0D',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Stack gap={26}>
            <Box px={8}>
              <Image src={flowfundLogo} alt="FlowFund" w={148} fit="contain" />
            </Box>

            {navSections.map((section) => (
              <Stack key={section.label} gap={12}>
                <Group gap={8} px={8} wrap="nowrap">
                  <Image src={placeholderWorkspaceIcon} alt="" w={12} h={12} />
                  <Text
                    tt="uppercase"
                    style={{
                      fontSize: 11,
                      letterSpacing: '0.18em',
                      color: '#6F7872',
                    }}
                  >
                    {section.label}
                  </Text>
                </Group>

                <Stack gap={4}>
                  {section.items.map((item) => (
                    <NavItem key={item.to} item={item} />
                  ))}
                </Stack>
              </Stack>
            ))}
          </Stack>

          <Stack gap={14}>
            <Paper
              radius={16}
              px={16}
              py={14}
              style={{
                background: 'linear-gradient(180deg, #67DA83 0%, #59C572 100%)',
                color: '#0B150E',
              }}
            >
              <Stack gap={8}>
                <Text
                  tt="uppercase"
                  style={{
                    fontSize: 10,
                    letterSpacing: '0.18em',
                    color: 'rgba(11, 21, 14, 0.62)',
                  }}
                >
                  Pluto insight
                </Text>
                <Text
                  fw={700}
                  style={{
                    fontSize: 14,
                    lineHeight: 1.22,
                    letterSpacing: '-0.03em',
                  }}
                >
                  Budgeting in your head only gets you so far.
                </Text>
              </Stack>
            </Paper>

            <Paper
              radius={14}
              px={12}
              py={10}
              style={{
                background: '#111311',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Group justify="space-between" wrap="nowrap">
                <Group gap={10} wrap="nowrap">
                  <Avatar src={avatarSrc} size={34} radius="xl" />
                  <div>
                    <Text fw={600} style={{ fontSize: 14, color: '#F2F3F2', letterSpacing: '-0.03em' }}>{displayName}</Text>
                    <Text size="xs" c="#6B736F">Signed in</Text>
                  </div>
                </Group>
                <UnstyledButton
                  onClick={handleLogout}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 999,
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#AEB7B1',
                    fontSize: 12,
                    lineHeight: 1,
                  }}
                >
                  Log out
                </UnstyledButton>
              </Group>
            </Paper>
          </Stack>
        </Paper>

        <Paper radius={0} style={{ background: '#0D0F0D', overflow: 'hidden' }}>
          <ScrollArea h="100%" type="never">
            <Box px={28} pt={20} pb={28}>
              <Outlet />
            </Box>
          </ScrollArea>
        </Paper>

        <PlutoRail displayName={displayName} />
      </Box>
    </Box>
  )
}
