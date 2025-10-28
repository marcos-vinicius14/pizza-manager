import chalk from 'chalk'
import logger from '../../../logger'
import { RestaurantRepository } from '../../repositories/restaurant.repository'
import { RestaurantAlreadyExistsError } from './exceptions/RestaurantAlreadyExistsError'
import { RestaurantValidationError } from './exceptions/RestaurantValidationError'

interface CreateRestaurantRequest {
  restaurantName: string
  name: string
  email: string
  phone: string
}

interface CreateRestaurantResponse {
  id: string
  restaurantName: string
  managerId: string
  createdAt: Date
}

export class RestaurantService {
  constructor(private restaurantRepository: RestaurantRepository) {}

  async createRestaurant({
    restaurantName,
    name,
    email,
    phone,
  }: CreateRestaurantRequest): Promise<CreateRestaurantResponse> {
    try {
      this.validateRestaurantInput({ restaurantName, name, email, phone })



      const existingRestaurant = await this.restaurantRepository.findRestaurantByName(
        restaurantName
      )
      if (existingRestaurant) {
        logger.error(chalk.redBright(`✗  Restaurant already exists: ${restaurantName}`));
        throw new RestaurantAlreadyExistsError(
          `Restaurante com nome "${restaurantName}" já existe`
        )
      }

      const result = await this.restaurantRepository.transaction(async (trx) => {
        const manager = await this.restaurantRepository.createUser(
          {
            name,
            email,
            phone,
          },
          trx
        )

        if (!manager || !manager.id) {
          logger.error(chalk.redBright(`✗  Error while create manager: ${manager}`));
          throw new RestaurantValidationError(
            'Falha ao criar gerente'
          )
        }

        const restaurant = await this.restaurantRepository.createRestaurant(
          {
            restaurantName,
            managerId: manager.id,
          },
          trx
        )

        if (!restaurant || !restaurant.id) {
          logger.error(chalk.redBright(`✗  Error while create restaurant: ${restaurant}`));
          throw new RestaurantValidationError(
            'Falha ao criar restaurante'
          )
        }

        return {
          restaurant,
          manager,
        }
      })

      logger.info(chalk.greenBright(`✓  Restaurant created: ${restaurantName}`));
      logger.info(chalk.greenBright(`✓  Manager created: ${name}`));

      return {
        id: result.restaurant.id,
        restaurantName: result.restaurant.name,
        managerId: result.manager.id,
        createdAt: result.restaurant.createdAt,
      }
    } catch (error) {
      if (
        error instanceof RestaurantValidationError ||
        error instanceof RestaurantAlreadyExistsError
      ) {
        throw error
      }

      logger.error(chalk.redBright(`✗  Error while create restaurant: ${error}`));

      throw new Error(
        'Erro interno ao criar restaurante. Por favor, tente novamente.'
      )
    }
  }

  private validateRestaurantInput(data: CreateRestaurantRequest): void {
    const errors: string[] = []

    if (!data.restaurantName || data.restaurantName.trim().length < 3) {
      errors.push('Nome do restaurante deve ter no mínimo 3 caracteres')
    }

    if (!data.name || data.name.trim().length < 3) {
      errors.push('Nome do gerente deve ter no mínimo 3 caracteres')
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push('Email inválido')
    }

    if (!data.phone || !this.isValidPhone(data.phone)) {
      errors.push('Telefone inválido')
    }

    if (errors.length > 0) {
      throw new RestaurantValidationError(errors.join('; '))
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^S@]+@[^S@]+\.[^S@]+$/
    return emailRegex.test(email)
  }

  private isValidPhone(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '')
    return cleanPhone.length >= 10 && cleanPhone.length <= 15
  }

  async getRestaurantById(id: string) {
    try {
      const restaurant = await this.restaurantRepository.findRestaurantById(id)
      
      if (!restaurant) {
        logger.error(chalk.redBright(`✗  Error not found restaurant: ${id}`));
        throw new RestaurantValidationError(`Restaurante ${id} não encontrado`)
      }

      return restaurant
    } catch (error) {
      if (error instanceof RestaurantValidationError) {
        throw error
      }

      logger.error(chalk.redBright(`✗  Error while get restaurant by id: ${error}`))
      throw new Error('Erro ao buscar restaurante')
    }
  }

  async getManagedRestaurant(restaurantId: string) {
    if (!restaurantId) {
      throw new RestaurantValidationError('Restaurante não encontrado, usuário não autorizado');
    }

    const restaurant = await this.restaurantRepository.findRestaurantById(restaurantId);

    if (!restaurant) {
      throw new RestaurantValidationError(`Restaurante ${restaurantId} não encontrado`);
    }

    return restaurant;
  }

  async listRestaurants(options: { page: number; limit: number }) {
    try {
      const restaurants = await this.restaurantRepository.listRestaurants(options);
      return restaurants;
    } catch (error) {
      logger.error(chalk.redBright(`✗  Error while listing restaurants: ${error}`))
      throw new Error('Erro ao listar restaurantes');
    }
  }
}