import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL:
    typeof window !== 'undefined'
      ? window.location.origin
      : 'http://localhost:3000',
  fetchOptions: {
    credentials: 'include', // This ensures cookies are sent with every request
  },
})
