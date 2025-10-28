import { UserRepository } from '../../repositories/user.repository';

export class UserService {
    constructor(private userRepository: UserRepository) { }

    async getUserProfile(userId: string) {
        const currentUser = await this.userRepository.findById(userId);

        if (!currentUser) {
            throw new Error('User not found');
        }

        return currentUser;
    }
}
