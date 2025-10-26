import chalk from "chalk";
import dayjs from "dayjs";
import  { eq } from "drizzle-orm";
import Elysia, { t } from "elysia";
import logger from "../../../logger";
import  { db } from "../../db/connection";
import { authLinks, restaurants } from "../../db/schema";
import { auth } from "../auth";

export const authenticateFromLink = new Elysia()
    .use(auth)
    .get('/auth-links/authenticate', async (context) => {

        const { query, set } = context;
        const { code, redirect } = query;

        const [authLinkFromCode] = await db
            .select()
            .from(authLinks)
            .where(eq(authLinks.code, code));

        if (!authLinkFromCode) {
            logger.info(chalk.redBright(`✗  Auth Link não encontrado  ${code}`))
            throw new Error('Auth Link não encontrado');
        }

        const daysSinceAuthLinkWasCreated = dayjs()
            .diff(dayjs(authLinkFromCode.createdAt), 'day');

        if (daysSinceAuthLinkWasCreated > 7) {
            throw new Error('Auth Link expirado');
        }

        const [managerRestaurant] = await db
            .select()
            .from(restaurants)
            .where(eq(restaurants.managerId, authLinkFromCode.userId));

        await context.signUser({ 
            sub: authLinkFromCode.userId,
            restaurantId: managerRestaurant?.id,
        });

        await db
            .delete(authLinks)
            .where(eq(authLinks.id, authLinkFromCode.id));

        set.redirect = redirect;

    }, {
        query: t.Object({
            code: t.String(),
            redirect: t.String(),
        })
    });