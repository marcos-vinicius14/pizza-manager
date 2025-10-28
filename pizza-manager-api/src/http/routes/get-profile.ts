import Elysia from "elysia";
import { auth } from "../auth";
import { UserService } from "../../services/user/user.service";
import { UserRepository } from "../../repositories/user.repository";

export const getProfile = new Elysia()
    .use(auth)
    .get('/me', async ({ getCurrentUser }) => {
        const { userId } = await getCurrentUser();
        const userRepository = new UserRepository();
        const userService = new UserService(userRepository);

        const user = await userService.getUserProfile(userId);

        return user;
    });