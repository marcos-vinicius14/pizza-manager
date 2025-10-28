
import type { IRestaurantRepository } from "@/modules/restaurants/domain/restaurant.repository";
import dayjs from "dayjs";
import type { IAuthLinkRepository } from "../../domain/auth-link.repository";


interface AuthenticateFromLinkUseCaseRequest {
  code: string;
}

interface AuthenticateFromLinkUseCaseResponse {
  userId: string;
  restaurantId?: string;
}

export class AuthenticateFromLinkUseCase {
  constructor(
    private authLinkRepository: IAuthLinkRepository,
    private restaurantRepository: IRestaurantRepository
  ) {}

  async execute({ code }: AuthenticateFromLinkUseCaseRequest): Promise<AuthenticateFromLinkUseCaseResponse> {
    const authLink = await this.authLinkRepository.findByCode(code);

    if (!authLink) {
      throw new Error("Auth link not found or already used.");
    }

    const daysSinceAuthLinkWasCreated = dayjs().diff(dayjs(authLink.createdAt), "day");

    if (daysSinceAuthLinkWasCreated > 7) {
      throw new Error("Auth link expired, please generate a new one.");
    }

    const managedRestaurant = await this.restaurantRepository.findManagedRestaurant(authLink.userId);

    await this.authLinkRepository.delete(authLink.code);

    return {
      userId: authLink.userId as string,
      restaurantId: managedRestaurant?.id,
    };
  }
}
