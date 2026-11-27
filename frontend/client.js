// Same-origin requests: Express serves the app in production and
// the Vite dev server proxies API calls to Express during development.
async function request(path, { method = 'GET', body } = {}) {
  let response
  try {
    response = await fetch(path, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?')
  }

  let data = null
  try {
    data = await response.json()
  } catch {
    // empty or non-JSON body
  }

  if (!response.ok) {
    const error = new Error(data?.error || `Request failed (${response.status})`)
    error.status = response.status
    throw error
  }
  return data
}

export const get = (path) => request(path)
export const post = (path, body) => request(path, { method: 'POST', body })
export const del = (path) => request(path, { method: 'DELETE' })
