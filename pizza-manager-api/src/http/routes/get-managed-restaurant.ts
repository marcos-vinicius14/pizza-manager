import Elysia from "elysia";
import { auth } from "../auth";
import { RestaurantService } from "../../services/restaurant/restaurant.service";
import { RestaurantRepository } from "../../repositories/restaurant.repository";

export const getManagedRestaurants = new Elysia()
    .use(auth)
    .get('/managed-restaurants', async ({ getCurrentUser }) => {
        const { restaurantId } = await getCurrentUser();
        const restaurantRepository = new RestaurantRepository();
        const restaurantService = new RestaurantService(restaurantRepository);

        const restaurant = await restaurantService.getManagedRestaurant(restaurantId as string);

        return restaurant;
    });