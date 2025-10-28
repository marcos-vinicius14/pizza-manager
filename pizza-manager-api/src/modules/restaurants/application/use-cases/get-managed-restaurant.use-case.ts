
import { Restaurant } from "../../domain/restaurant.entity";
import { IRestaurantRepository } from "../../domain/restaurant.repository";

interface GetManagedRestaurantUseCaseRequest {
  managerId: string;
}

export class GetManagedRestaurantUseCase {
  constructor(private restaurantRepository: IRestaurantRepository) {}

  async execute({ managerId }: GetManagedRestaurantUseCaseRequest): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findManagedRestaurant(managerId);

    if (!restaurant) {
      throw new Error("Managed restaurant not found for this user.");
    }

    return restaurant;
  }
}
