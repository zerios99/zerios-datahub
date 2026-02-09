import { createMiddleware } from '@tanstack/react-start'

import { getRequestHeaders } from '@tanstack/react-start/server'

import { redirect } from '@tanstack/react-router'
import { auth } from '@/lib/auth'
const PUBLIC_ROUTES = ['/login', '/register', '/api']

export const authMiddleware = createMiddleware({ type: 'request' }).server(
  async ({ next, request }) => {
    const url = new URL(request.url)

    // Skip middleware for public routes and API routes
    if (PUBLIC_ROUTES.some((route) => url.pathname.startsWith(route))) {
      return next()
    }

    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })

    if (!session) {
      throw redirect({
        to: '/login',
        search: {
          redirect: url.pathname,
        },
      })
    }

    return next({ context: { session } })
  },
)
