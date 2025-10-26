import Elysia from "elysia";
import { auth } from "../auth";
import { eq } from "drizzle-orm";
import { db } from "../../db/connection";
import  { restaurants } from "../../db/schema";
import chalk from "chalk";
import logger from "../../../logger";

export const getManagedRestaurants = new Elysia()
    .use(auth)
    .get('/managed-restaurants', async ({ getCurrentUser}) => {
        const { restaurantId } = await getCurrentUser();

        if (!restaurantId) {
            logger.error(chalk.redBright(`✗  Unauthorized`))
            throw new Error('Unauthorized');
        }


        const managedRestaurants = await db
            .select()
            .from(restaurants)
            .where(eq(restaurants.id, restaurantId as string));

        return managedRestaurants;
    })