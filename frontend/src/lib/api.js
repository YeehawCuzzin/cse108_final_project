export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token')
  const headers = new Headers(options.headers || {})
  const hasBody = options.body !== undefined && options.body !== null
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (hasBody && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(path, {
    ...options,
    headers,
  })

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const message = payload?.error || payload?.message || 'Request failed'
    const error = new Error(message)
    error.status = response.status
    error.payload = payload
    throw error
  }

  return payload
}
