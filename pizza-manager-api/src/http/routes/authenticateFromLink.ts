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
    .get('/auth-links/authenticate', async ({ query, set, signUser }) => {

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

        await signUser({
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

function signUser(arg0: { sub: string; restaurantId: string; }) {
    throw new Error("Function not implemented.");
}
