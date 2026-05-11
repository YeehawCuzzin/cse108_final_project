import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MantineProvider, createTheme } from '@mantine/core'
import '@mantine/core/styles.css'
import './styles/global.css'
import App from './App'
import { AuthProvider } from './context/AuthContext'

const theme = createTheme({
  primaryColor: 'green',
  defaultRadius: 'lg',
  fontFamily: "'Satoshi', sans-serif",
  headings: {
    fontFamily: "'Satoshi', sans-serif",
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <AuthProvider>
          <App />
        </AuthProvider>
      </MantineProvider>
    </BrowserRouter>
  </React.StrictMode>
)
