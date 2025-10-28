import Elysia, { t } from "elysia";
import { AuthService } from "../../services/auth/auth.service";
import { AuthRepository } from "../../repositories/auth-repository/auth.repository";

export const authRoutes = new Elysia().post('/authenticate', async ({ body, set }) => {
    const { email } = body;

    const authRepository = new AuthRepository();
    const authService = new AuthService(authRepository);

    try {
        await authService.sendAuthLink(email);
        set.status = 204; // Success, no content
    } catch (error: any) {
        set.status = 400; // Bad Request
        return {
            success: false,
            message: error.message
        };
    }
}, {
    body: t.Object({
        email: t.String({
            format: 'email',
            error: 'Email inválido'
          }),
    })
});