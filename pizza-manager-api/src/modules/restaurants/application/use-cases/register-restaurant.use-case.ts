
import { IRestaurantRepository } from "../../domain/restaurant.repository";
import { IUserRepository } from "../../../users/domain/user.repository";

interface RegisterRestaurantUseCaseRequest {
  restaurantName: string;
  managerName: string;
  email: string;
  phone: string;
}

export class RegisterRestaurantUseCase {
  constructor(
    private userRepository: IUserRepository,
    private restaurantRepository: IRestaurantRepository
  ) {}

  async execute({
    restaurantName,
    managerName,
    email,
    phone,
  }: RegisterRestaurantUseCaseRequest): Promise<void> {
    // NOTE: The transaction logic will be added later when the UoW pattern is implemented.
    const manager = await this.userRepository.create({
      name: managerName,
      email,
      phone,
      role: "manager",
    });

    await this.restaurantRepository.create({
      name: restaurantName,
      managerId: manager.id,
      description: "",
    });
  }
}
