import Elysia, { t } from "elysia";
import { auth } from "../auth";
import { AuthService } from "../../services/auth/auth.service";
import { AuthRepository } from "../../repositories/auth-repository/auth.repository";
import { RestaurantRepository } from "../../repositories/restaurant.repository";

export const authenticateFromLink = new Elysia()
    .use(auth)
    .get('/auth-links/authenticate', async (context) => {
        const { query, set, signUser } = context;
        const { code, redirect } = query;

        const authRepository = new AuthRepository();
        const restaurantRepository = new RestaurantRepository();
        const authService = new AuthService(authRepository, restaurantRepository);

        try {
            const { userId, restaurantId } = await authService.authenticateFromLink(code);
            
            await signUser({ 
                sub: userId,
                restaurantId: restaurantId,
            });

            set.redirect = redirect;
        } catch (error: any) {
            set.status = 401; // Unauthorized
            return { success: false, message: error.message };
        }
    }, {
        query: t.Object({
            code: t.String(),
            redirect: t.String(),
        })
    });