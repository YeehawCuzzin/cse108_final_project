import { Box, Button, Container, Group, Image, Paper, Text, Title } from '@mantine/core'
import { Link } from 'react-router-dom'
import AsciiParticleBackground from './AsciiParticleBackground'
import flowfundLogo from '../assets/flowfund.svg'

function NavPill({ label, to, active, filled }) {
  return (
    <Button
      component={Link}
      to={to}
      variant={filled ? 'filled' : 'subtle'}
      radius="xl"
      styles={{
        root: {
          height: 40,
          paddingInline: filled ? 18 : 14,
          background: filled ? '#66DD84' : 'transparent',
          color: filled ? '#0E140F' : active ? '#F3F4F3' : '#C8D0CA',
          fontWeight: 600,
          fontSize: 14,
          border: filled ? 'none' : '1px solid transparent',
        },
        label: {
          letterSpacing: '-0.03em',
        },
      }}
    >
      {label}
    </Button>
  )
}

export default function AuthShell({
  mode = 'landing',
  title,
  description,
  children,
}) {
  const isLogin = mode === 'login'
  const isRegister = mode === 'register'

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: '#111111',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <AsciiParticleBackground />

      <Box
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 55% 42%, rgba(102, 221, 132, 0.08), transparent 34%), linear-gradient(180deg, rgba(0,0,0,0.16) 0%, rgba(0,0,0,0.58) 100%)',
        }}
      />

      <Container
        size={1500}
        px={30}
        py={22}
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Group justify="space-between" align="center" mb={isLogin || isRegister ? 72 : 140}>
          <Link to="/" style={{ display: 'inline-flex' }}>
            <Image src={flowfundLogo} alt="FlowFund" w={138} fit="contain" />
          </Link>

          <Group gap={8} wrap="nowrap">
            <NavPill label="Login" to="/login" active={isLogin} filled={false} />
            <NavPill label="Sign up" to="/register" active={isRegister} filled />
          </Group>
        </Group>

        <Box
          style={{
            flex: 1,
            display: 'flex',
            alignItems: isLogin || isRegister ? 'center' : 'center',
            justifyContent: isLogin || isRegister ? 'flex-start' : 'center',
            paddingBottom: isLogin || isRegister ? 0 : 96,
          }}
        >
          <div style={{ width: '100%' }}>
            {mode === 'landing' ? (
              <div
                style={{
                  maxWidth: 1180,
                  margin: '0 auto',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Title
                  order={1}
                  style={{
                    maxWidth: 920,
                    fontSize: 64,
                    lineHeight: 1,
                    fontWeight: 500,
                    color: '#F0F1F0',
                    letterSpacing: '-0.065em',
                    textAlign: 'center',
                    marginBottom: 34,
                  }}
                >
                  A{' '}
                  <Text span inherit c="#66DD84" fs="italic">
                    second brain
                  </Text>{' '}
                  for your money.
                </Title>

                <Box
                  style={{
                    width: '100%',
                    maxWidth: 1120,
                    borderTop: '1px solid rgba(120, 150, 128, 0.4)',
                    paddingTop: 22,
                  }}
                >
                  <Group justify="center" align="center">
                    <Text
                      style={{
                        maxWidth: 700,
                        fontSize: 19,
                        lineHeight: 1.15,
                        color: '#D6DDD7',
                        letterSpacing: '-0.035em',
                        textAlign: 'center',
                      }}
                    >
                      FlowFund watches how you use money, finds the patterns you miss, and turns them into a plan you can follow.
                    </Text>

                    <Button
                      component={Link}
                      to="/register"
                      radius="xl"
                      styles={{
                        root: {
                          height: 48,
                          paddingInline: 26,
                          background: '#66DD84',
                          color: '#101610',
                          fontWeight: 700,
                          fontSize: 16,
                        },
                        label: {
                          letterSpacing: '-0.03em',
                        },
                      }}
                    >
                      Get Started
                    </Button>
                  </Group>
                </Box>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) 460px',
                  gap: 48,
                  alignItems: 'center',
                }}
              >
                <div>
                  <Text
                    tt="uppercase"
                    style={{
                      fontSize: 12,
                      letterSpacing: '0.18em',
                      color: '#7F8881',
                      marginBottom: 14,
                    }}
                  >
                    FlowFund AI
                  </Text>
                  <Title
                    order={1}
                    style={{
                      maxWidth: 700,
                      fontSize: 58,
                      lineHeight: 0.98,
                      fontWeight: 500,
                      color: '#F0F1F0',
                      letterSpacing: '-0.065em',
                      marginBottom: 22,
                    }}
                  >
                    A{' '}
                    <Text span inherit c="#66DD84" fs="italic">
                      second brain
                    </Text>{' '}
                    for your money.
                  </Title>
                  <Text
                    style={{
                      maxWidth: 560,
                      fontSize: 20,
                      lineHeight: 1.15,
                      color: '#D0D7D1',
                      letterSpacing: '-0.03em',
                    }}
                  >
                    {description}
                  </Text>
                </div>

                <Paper
                  radius={28}
                  px={28}
                  py={28}
                  style={{
                    background: 'rgba(20, 23, 20, 0.86)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    boxShadow: '0 30px 80px rgba(0, 0, 0, 0.35)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <Text
                    tt="uppercase"
                    style={{
                      fontSize: 11,
                      letterSpacing: '0.16em',
                      color: '#707972',
                      marginBottom: 12,
                    }}
                  >
                    {isLogin ? 'Welcome back' : 'Create your account'}
                  </Text>
                  <Title
                    order={2}
                    style={{
                      fontSize: 36,
                      lineHeight: 1,
                      color: '#F3F4F3',
                      fontWeight: 500,
                      letterSpacing: '-0.05em',
                      marginBottom: 10,
                    }}
                  >
                    {title}
                  </Title>
                  <Text
                    style={{
                      fontSize: 15,
                      lineHeight: 1.2,
                      color: '#98A29B',
                      letterSpacing: '-0.02em',
                      marginBottom: 24,
                    }}
                  >
                    {description}
                  </Text>

                  {children}
                </Paper>
              </div>
            )}
          </div>
        </Box>
      </Container>
    </Box>
  )
}
