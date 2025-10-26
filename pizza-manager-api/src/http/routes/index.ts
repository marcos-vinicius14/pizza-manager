import { Elysia } from 'elysia'
import { restaurantRoutes } from './restaurant.routes'
import { authRoutes } from './send-auth-link'
import { authenticateFromLink } from './authenticateFromLink'
import { signOut } from './signOut'

export const appRoutes = new Elysia({ name: 'appRoutes' })
  .use(restaurantRoutes)
  .use(authRoutes)
  .use(authenticateFromLink)
  .use(signOut)
