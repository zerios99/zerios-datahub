import { auth } from '@/lib/auth'
import { createMiddleware } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { redirect } from '@tanstack/react-router'

const PUBLIC_ROUTES = ['/login', '/register']

export const authMiddleware = createMiddleware({ type: 'request' }).server(
  async ({ next, request }) => {
    const url = new URL(request.url)

    if (PUBLIC_ROUTES.includes(url.pathname)) {
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
