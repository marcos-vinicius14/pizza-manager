import { Elysia } from 'elysia'
import { restaurantRoutes } from './restaurant.routes'
import { authRoutes } from './send-auth-link'

export const appRoutes = new Elysia({ name: 'appRoutes' })
  .use(restaurantRoutes)
  .use(authRoutes)
