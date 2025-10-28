import Elysia from "elysia";
import { auth } from "@/http/auth";
import { GetManagedRestaurantUseCase } from "@/modules/restaurants/application/use-cases/get-managed-restaurant.use-case";
import { DrizzleRestaurantRepository } from "@/modules/restaurants/infra/repositories/drizzle-restaurant.repository";

export const getManagedRestaurant = new Elysia().use(auth).get(
  "/managed-restaurant",
  async ({ getCurrentUser }) => {
    const { restaurantId, sub: managerId } = await getCurrentUser();

    const restaurantRepository = new DrizzleRestaurantRepository();
    const getManagedRestaurantUseCase = new GetManagedRestaurantUseCase(restaurantRepository);
    const restaurant = await getManagedRestaurantUseCase.execute({ managerId });

    return restaurant;
  }
);