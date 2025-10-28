import Elysia, { t } from "elysia";
import { RegisterRestaurantUseCase } from "@/modules/restaurants/application/use-cases/register-restaurant.use-case";
import { DrizzleUserRepository } from "@/modules/users/infra/repositories/drizzle-user.repository";
import { DrizzleRestaurantRepository } from "@/modules/restaurants/infra/repositories/drizzle-restaurant.repository";

export const restaurantRoutes = new Elysia().post(
  "/restaurants",
  async ({ body, set }) => {
    const { restaurantName, managerName, email, phone } = body;

    const userRepository = new DrizzleUserRepository();
    const restaurantRepository = new DrizzleRestaurantRepository();
    const registerRestaurantUseCase = new RegisterRestaurantUseCase(
      userRepository,
      restaurantRepository
    );

    try {
      await registerRestaurantUseCase.execute({
        restaurantName,
        managerName,
        email,
        phone,
      });

      set.status = 204;
    } catch (error: any) {
      set.status = 400;
      return { message: error.message };
    }
  },
  {
    body: t.Object({
      restaurantName: t.String(),
      managerName: t.String(),
      email: t.String({ format: "email" }),
      phone: t.String(),
    }),
  }
);