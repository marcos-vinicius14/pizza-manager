

import type { IUserRepository } from "@/modules/users/domain/user.repository";
import { createId } from "@paralleldrive/cuid2";
import type { IAuthLinkRepository } from "../../domain/auth-link.repository";
import type { IMailProvider } from "../providers/mail.provider";

interface SendAuthLinkUseCaseRequest {
  email: string;
}

export class SendAuthLinkUseCase {
  constructor(
    private userRepository: IUserRepository,
    private authLinkRepository: IAuthLinkRepository,
    private mailProvider: IMailProvider
  ) { }

  async execute({ email }: SendAuthLinkUseCaseRequest): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error("User not found.");
    }

    const authLinkCode = createId();

    await this.authLinkRepository.create({
      userId: user.id,
      code: authLinkCode,
    });

    const authLink = new URL("/auth-links/authenticate", process.env.API_BASE_URL);
    authLink.searchParams.set("code", authLinkCode);
    authLink.searchParams.set("redirect", process.env.AUTH_REDIRECT_URL!);

    await this.mailProvider.sendMail(
      email,
      "Authenticate to Pizza Manager",
      `Use the following link to authenticate on Pizza Manager: ${authLink.href}`
    );
  }
}
