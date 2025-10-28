import { Restaurant } from './restaurant.entity'

export interface IRestaurantRepository {
  findManagedRestaurant(managerId: string): Promise<Restaurant | null>
  create(restaurant: Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Restaurant>
}
