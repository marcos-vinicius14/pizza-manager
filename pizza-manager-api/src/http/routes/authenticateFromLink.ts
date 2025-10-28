import Elysia, { t } from "elysia";
import { auth } from "@/http/auth";
import { AuthenticateFromLinkUseCase } from "@/modules/auth/application/use-cases/authenticate-from-link.use-case";
import { DrizzleAuthRepository } from "@/modules/auth/infra/repositories/drizzle-auth.repository";
import { DrizzleRestaurantRepository } from "@/modules/restaurants/infra/repositories/drizzle-restaurant.repository";

export const authenticateFromLink = new Elysia().use(auth).get(
  "/auth-links/authenticate",
  async ({ query, set, signUser }) => {
    const { code, redirect } = query;

    const authLinkRepository = new DrizzleAuthRepository();
    const restaurantRepository = new DrizzleRestaurantRepository();
    const authenticateFromLinkUseCase = new AuthenticateFromLinkUseCase(
      authLinkRepository,
      restaurantRepository
    );

    try {
      const { userId, restaurantId } = await authenticateFromLinkUseCase.execute({ code });

      await signUser({
        sub: userId,
        restaurantId: restaurantId,
      });

      set.redirect = redirect;
    } catch (error: any) {
      set.status = 401; // Unauthorized
      return { success: false, message: error.message };
    }
  },
  {
    query: t.Object({
      code: t.String(),
      redirect: t.String(),
    }),
  }
);