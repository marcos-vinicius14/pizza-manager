import Elysia, { t } from "elysia";
import { db } from "../../db/connection";
import { authLinks, restaurants } from "../../db/schema";
import { eq } from "drizzle-orm";
import dayjs from "dayjs";
import { auth } from "../auth";
import logger from "../../../logger";
import chalk from "chalk";

export const authenticateFromLink = new Elysia()
    .use(auth)
    .get('/auth-links/authenticate', async ({ query, jwt, cookie, set }) => {

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
            .where(eq(restaurants.id, authLinkFromCode.userId));


        const jwtToken = await jwt.sign({
            sub: authLinkFromCode.userId,
            restaurantId: managerRestaurant?.id,
        });


        cookie.token?.set({
            value: jwtToken,
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
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