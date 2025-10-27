import { Elysia } from 'elysia'
import { restaurantRoutes } from './restaurant.routes'
import { authRoutes } from './send-auth-link'
import { authenticateFromLink } from './authenticateFromLink'
import { signOut } from './signOut'
import { auth } from '../auth'
import { getProfile } from './get-profile'
import { getManagedRestaurants } from './get-managed-restaurant'
import { getOrderDetails } from './get-order-details'

export const appRoutes = new Elysia({ name: 'appRoutes' })
  .use(auth)
  .use(restaurantRoutes)
  .use(authRoutes)
  .use(authenticateFromLink)
  .use(signOut)
  .use(getProfile)
  .use(getManagedRestaurants)
  .use(getOrderDetails)
  .onError(({code, error, set }) => {
    switch (code) {
      case 'VALIDATION':
        set.status = error.status;
        return {
          code,
          message: 'Validatio  error',
          details: error.message,
        }
        default: {
          set.status = 500;
          return {
            code,
            message: 'Internal Server Error',
          }
        }
    }

  })
