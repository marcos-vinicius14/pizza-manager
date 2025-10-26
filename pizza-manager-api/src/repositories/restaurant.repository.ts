import chalk from 'chalk'
import logger from '../../logger'
import { db } from '../db/connection'
import { restaurants, user } from '../db/schema'
import { eq } from 'drizzle-orm'
import type { PgTransaction } from 'drizzle-orm/pg-core'
import type { CreateUserData, User, CreateRestaurantData, Restaurant } from './interfaces'




type Transaction = PgTransaction<any, any, any>

export class RestaurantRepository {

  async createUser(
    data: CreateUserData,
    trx?: Transaction
  ): Promise<User> {
    const dbInstance = trx || db

    const [createdUser] = await dbInstance
      .insert(user)
      .values({
        name: data.name,
        email: data.email,
        phone: data.phone,
        userRole: 'manager',
      })
      .returning()

    if (!createdUser) {
      throw new Error('Falha ao criar usuário no banco de dados')
    }

    return createdUser as User
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const [foundUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1)

    return foundUser ? (foundUser as User) : null
  }

  async findUserById(id: string): Promise<User | null> {
    const [foundUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1)

    return foundUser ? (foundUser as User) : null
  }


  async createRestaurant(
    data: CreateRestaurantData,
    trx?: Transaction
  ): Promise<Restaurant> {
    const dbInstance = trx || db

    const [createdRestaurant] = await dbInstance
      .insert(restaurants)
      .values({
        name: data.restaurantName,
        managerId: data.managerId,
        description: '',
      })
      .returning()

    if (!createdRestaurant) {
      throw new Error('Falha ao criar restaurante no banco de dados')
    }

    return createdRestaurant as Restaurant
  }

  async findRestaurantByName(name: string): Promise<Restaurant | null> {
    const [foundRestaurant] = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.name, name))
      .limit(1)

    return foundRestaurant ? (foundRestaurant as Restaurant) : null
  }

  async findRestaurantById(id: string): Promise<Restaurant | null> {
    const [foundRestaurant] = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.id, id))
      .limit(1)

    return foundRestaurant ? (foundRestaurant as Restaurant) : null
  }

  async findRestaurantByManagerId(managerId: string): Promise<Restaurant | null> {
    const [foundRestaurant] = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.managerId, managerId))
      .limit(1)

    return foundRestaurant ? (foundRestaurant as Restaurant) : null
  }

  async listRestaurants(options: {
    page: number
    limit: number
  }): Promise<{ data: Restaurant[]; total: number }> {
    const offset = (options.page - 1) * options.limit

    const data = await db
      .select()
      .from(restaurants)
      .limit(options.limit)
      .offset(offset)

    const totalResult = await db
      .select({ count: db.$count(restaurants) })
      .from(restaurants)

    const count = totalResult[0]?.count ?? 0

    return { data: data as Restaurant[], total: count };
  }


  async transaction<T>(
    callback: (trx: Transaction) => Promise<T>
  ): Promise<T> {
    return await db.transaction(async (trx) => {
      return await callback(trx)
    })
  }


  async updateRestaurant(
    id: string,
    data: Partial<{ name: string; description: string }>
  ): Promise<Restaurant> {
    const [updated] = await db
      .update(restaurants)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(restaurants.id, id))
      .returning()

    if (!updated) {
      logger.error(chalk.redBright(`✗  Error not found restaurant: ${id}`));
      throw new Error('Restaurante não encontrado para atualização')
    }

    return updated as Restaurant
  }

  async deleteRestaurant(id: string): Promise<void> {
    const result = await db
      .delete(restaurants)
      .where(eq(restaurants.id, id))
      .returning()

    if (result.length === 0) {
      logger.error(chalk.redBright(`✗  Error not found restaurant: ${id}`));
      throw new Error('Restaurante não encontrado para exclusão')
    }
  }

  async updateUser(
    id: string,
    data: Partial<{ name: string; email: string; phone: string }>
  ): Promise<User> {
    const [updated] = await db
      .update(user)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(user.id, id))
      .returning()

    if (!updated) {
      throw new Error('Usuário não encontrado para atualização')
    }

    return updated as User
  }
}