import { Elysia, t } from 'elysia'
import type { Context } from 'elysia'
import logger from '../../../logger'
import chalk from 'chalk'
import { RestaurantService } from '../../services/restaurant/restaurant.service'
import { RestaurantRepository } from '../../repositories/restaurant.repository'

interface CreateRestaurantBody {
  restaurantName: string
  name: string
  email: string
  phone: string
}

interface RestaurantContext extends Context {
  restaurantService: RestaurantService
  body: CreateRestaurantBody
}

const restaurantRepository = new RestaurantRepository()
const restaurantService = new RestaurantService(restaurantRepository)

export const restaurantRoutes = new Elysia({ name: 'restaurantRoutes' })
    .decorate('restaurantService', restaurantService)
    .get('/', () => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString()
      }
    })
    .post(
      '/restaurants',
      async ({ restaurantService, body, set }: RestaurantContext) => {
        try {
          const { restaurantName, name, email, phone } = body

          await restaurantService.createRestaurant({
            restaurantName,
            name,
            email,
            phone,
          })

          set.status = 201
          return {
            success: true,
            message: 'Restaurante criado com sucesso',
          }
        } catch (error) {
          logger.error(chalk.redBright(`✗  Error while create restaurant: ${error}`))
          throw error
        }
      },
      {
        body: t.Object({
          restaurantName: t.String({
            minLength: 3,
            maxLength: 100,
            error: 'Nome do restaurante deve ter entre 3 e 100 caracteres'
          }),
          name: t.String({
            minLength: 3,
            maxLength: 100,
            error: 'Nome deve ter entre 3 e 100 caracteres'
          }),
          email: t.String({
            format: 'email',
            error: 'Email inválido'
          }),
          phone: t.String({
            minLength: 10,
            maxLength: 15,
            pattern: '^[0-9+\-\s()]+$',
            error: 'Telefone inválido'
          }),
        }),
        detail: {
          tags: ['Restaurants'],
          summary: 'Criar novo restaurante',
          description: 'Endpoint para cadastrar um novo restaurante no sistema'
        }
      },
    )
    .get(
      '/restaurants',
      async ({ restaurantService, query }: any) => {
        const { page = 1, limit = 10 } = query

        const restaurants = await restaurantService.listRestaurants({
          page: Number(page),
          limit: Number(limit)
        })

        return {
          success: true,
          data: restaurants
        }
      },
      {
        query: t.Object({
          page: t.Optional(t.Numeric({ minimum: 1 })),
          limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 }))
        })
      }
    )