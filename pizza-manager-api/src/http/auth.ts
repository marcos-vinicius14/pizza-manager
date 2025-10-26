import cookie from "@elysiajs/cookie";
import jwt from "@elysiajs/jwt";
import Elysia, { t, type Static } from "elysia";

const jwtPayload = t.Object({
    sub: t.String(),
    restaurantId: t.Optional(t.String()),
})


export const auth = new Elysia()
    .use(jwt({
        secret: process.env.JWT_SECRET_KEY!,
        schema: t.Object({
            sub: t.String(),
            restaurantId: t.Optional(t.String()),

        })
    }))
    .use(cookie())
    .derive(({ jwt, setCookie, removeCookie}) => {
        return {
            signUser: async (payload: Static<typeof jwtPayload>) => {
                const jwtToken = await jwt.sign(payload);


               setCookie('auth', jwtToken, {
                    httpOnly: true,
                    maxAge: 60 * 60 * 24 * 7, // 7 days
                    path: '/'
               })
            },
            signOut: () => {
                removeCookie('auth');
            }
        }
    })