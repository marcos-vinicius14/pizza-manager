
import { User } from "../../domain/user.entity";
import { IUserRepository } from "../../domain/user.repository";

interface GetUserProfileUseCaseRequest {
  userId: string;
}

export class GetUserProfileUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute({ userId }: GetUserProfileUseCaseRequest): Promise<Omit<User, 'password'> | null> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return null;
    }

    // In a real app, you would explicitly map the fields to avoid leaking sensitive data.
    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }
}
