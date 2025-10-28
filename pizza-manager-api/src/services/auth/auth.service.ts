import type { AuthRepository } from "../../repositories/auth-repository/auth.repository"
import { createId } from "@paralleldrive/cuid2";
import { mailer } from "../../lib/mail";
import logger from "../../../logger";
import chalk from "chalk";
import dayjs from "dayjs";
import type { RestaurantRepository } from "../../repositories/restaurant.repository";

export class AuthService {

  constructor(
    private authRepository: AuthRepository,
    private restaurantRepository: RestaurantRepository
  ) {}

  async sendAuthLink(email: string) {
    const userFromEmail = await this.authRepository.findUserByEmail(email);

    if (!userFromEmail) {
        logger.error(chalk.redBright('User not found'));
        throw new Error('User not found');
    }

    const authLinkCode = createId();

    await this.authRepository.createAuthLink(userFromEmail.id, authLinkCode);

    const authLink = new URL('/auth-links/authenticate', process.env.API_BASE_URL);
    authLink.searchParams.set('code', authLinkCode);
    authLink.searchParams.set('redirect', process.env.AUTH_REDIRECT_URL!);

    await mailer.sendMail({
        from: {
            name: 'Pizza Manager',
            address: 'hi@pizza-manager.com'
        },
        to: email,
        subject: 'Autenticação Pizza Manager',
        text: `Use the following link to authenticate on Pizza Manager: ${authLink.href}`
    });

    logger.info(chalk.yellowBright(`Auth link: ${authLink.href}`));
  }

  async authenticateFromLink(code: string) {
    const authLinkFromCode = await this.authRepository.findAuthLinkByCode(code);

    if (!authLinkFromCode) {
        logger.error(chalk.redBright('Auth Link not found'));
        throw new Error('Auth Link not found');
    }

    const daysSinceAuthLinkWasCreated = dayjs().diff(dayjs(authLinkFromCode.createdAt), 'day');

    if (daysSinceAuthLinkWasCreated > 7) {
        logger.error(chalk.redBright('Auth Link expired'));
        throw new Error('Auth Link expired');
    }

    const managerRestaurant = await this.restaurantRepository.findRestaurantByManagerId(authLinkFromCode.userId);

    await this.authRepository.deleteAuthLink(authLinkFromCode.id);

    return {
        userId: authLinkFromCode.userId,
        restaurantId: managerRestaurant?.id,
    }
  }

  async findAuthLinkByCode(code: string) {
    const authLink = await this.authRepository.findAuthLinkByCode(code);

    if(!authLink) {
        throw new Error('Auth Link não encontrado');
    
    }
  }

  async deleteAuthLink(id: string) {
    return this.authRepository.deleteAuthLink(id)
  }

}