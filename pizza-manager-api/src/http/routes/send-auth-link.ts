import Elysia, { t } from "elysia";
import { db } from "../../db/connection";
import { eq } from 'drizzle-orm';
import { authLinks, user } from "../../db/schema";
import { createId } from "@paralleldrive/cuid2";


export const authRoutes = new Elysia().post('/authenticate', async ({ body }) => {
    const { email } = body;

    const [userFromEmail] = await db
        .select()
        .from(user)
        .where(eq(user.email, email));

    if (!userFromEmail) {
        throw new Error('User not found');
    }

    const authLinkCode = createId();

    await db.insert(authLinks).values({
        userId: userFromEmail.id,
        code: authLinkCode,
    })

    // TODO: Futuramente, essa rota deve enviar um email
    const authLink = new URL('/auth-links/authenticate', process.env.API_BASE_URL);
    authLink.searchParams.set('code', authLinkCode);
    authLink.searchParams.set('redirect', process.env.AUTH_REDIRECT_URL!);

    console.log(authLink);


}, {
    body: t.Object({
        email: t.String({
            format: 'email',
            error: 'Email inválido'
          }),

    })
})