import { eq } from "drizzle-orm";
import { db } from "@/core/infra/db";
import { Restaurant, restaurants } from "@/modules/restaurants/domain/restaurant.entity";
import { IRestaurantRepository } from "@/modules/restaurants/domain/restaurant.repository";

export class DrizzleRestaurantRepository implements IRestaurantRepository {
  async findManagedRestaurant(managerId: string): Promise<Restaurant | null> {
    const [restaurant] = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.managerId, managerId));

    return restaurant || null;
  }

  async create(restaurantData: Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Restaurant> {
    const [newRestaurant] = await db.insert(restaurants).values(restaurantData).returning();

    return newRestaurant;
  }
}