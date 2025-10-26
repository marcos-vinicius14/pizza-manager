import "dotenv/config"
import cookie from "@elysiajs/cookie";
import jwt from "@elysiajs/jwt";
import Elysia, { t, type Static } from "elysia";
import logger from "../../logger";
import chalk from "chalk";
import { Unauthorized } from "./exceptions/unauathorized-exception";

const jwtPayload = t.Object({
    sub: t.String(),
    restaurantId: t.Optional(t.String()),
})

export const auth = new Elysia()
    .error({
        UNAUTHORIZED: Unauthorized
    })
    .onError(({ error, code, set }) => {
        logger.info(chalk.redBright(`✗  Unauthorized: ${code} - ${error}`));
        switch (code) {
            case 'UNAUTHORIZED':
                set.status = 401;
                return {
                    code,
                    message: error.message,
                }
            default:
                set.status = 500;
                return {
                    code,
                    message: 'Internal Server Error',
                }
        }
    })
    .use(
        jwt({
            name: 'jwt',
            secret: process.env.JWT_SECRET_KEY!,
            schema: jwtPayload,
        })
    )
    .use(cookie())
    .derive({ as: 'global' }, (context) => {
        return {
            signUser: async (payload: Static<typeof jwtPayload>) => {
                const jwtToken = await context.jwt.sign(payload);

                context.cookie.auth?.set({
                    value: jwtToken,
                    httpOnly: true,
                    maxAge: 60 * 60 * 24 * 7, // 7 days
                    path: '/',
                });
            },
            signOut: () => {
                delete context.cookie.auth;
            },
            getCurrentUser: async () => {
                const authCookieAuth = context.cookie.auth;

                if (!authCookieAuth) {
                    logger.info(chalk.redBright(`✗  Unauthorized`))
                    throw new Unauthorized();
                }

                const payload = await context.jwt.verify(authCookieAuth);

                if (!payload) {
                    logger.error(chalk.redBright(`✗  Unauthorized - Invalid token`));
                    logger.info(chalk.yellowBright(`✗ Contentd Payload: ${payload}`))

                    throw new Unauthorized();
                }

                return {
                    userId: payload.sub,
                    restaurantId: payload.restaurantId
                };
            }
        }
    })