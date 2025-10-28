import Elysia, { t } from "elysia";
import { SendAuthLinkUseCase } from "@/modules/auth/application/use-cases/send-auth-link.use-case";
import { DrizzleUserRepository } from "@/modules/users/infra/repositories/drizzle-user.repository";
import { DrizzleAuthRepository } from "@/modules/auth/infra/repositories/drizzle-auth.repository";
import { NodemailerMailProvider } from "@/modules/auth/infra/providers/nodemailer-mail.provider";

export const sendAuthLink = new Elysia().post(
  "/authenticate",
  async ({ body, set }) => {
    const { email } = body;

    const userRepository = new DrizzleUserRepository();
    const authLinkRepository = new DrizzleAuthRepository();
    const mailProvider = new NodemailerMailProvider();

    const sendAuthLinkUseCase = new SendAuthLinkUseCase(
      userRepository,
      authLinkRepository,
      mailProvider
    );

    try {
      await sendAuthLinkUseCase.execute({ email });
      set.status = 204; // Success, no content
    } catch (error: any) {
      set.status = 400; // Bad Request
      return {
        success: false,
        message: error.message,
      };
    }
  },
  {
    body: t.Object({
      email: t.String({
        format: "email",
        error: "Invalid email format.",
      }),
    }),
  }
);