import Elysia from "elysia";
import { auth } from "../auth";
import { db } from "../../db/connection";
import { user } from "../../db/schema";
import { eq } from "drizzle-orm";
import logger from "../../../logger";
import chalk from "chalk";

export const getProfile = new Elysia()
    .use(auth)
    .get('/me', async ({ getCurrentUser }) => {
        const { userId } = await getCurrentUser();

        const currentUser = await db
            .select()
            .from(user)
            .where(eq(user.id, userId as string));

        if (!user) {
            logger.error(chalk.redBright(`✗  User not found`))
            throw new Error('User not found');
        }

        return currentUser;


    })