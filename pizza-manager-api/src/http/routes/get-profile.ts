import Elysia from "elysia";
import { auth } from "@/http/auth";
import { GetUserProfileUseCase } from "@/modules/users/application/use-cases/get-user-profile.use-case";
import { DrizzleUserRepository } from "@/modules/users/infra/repositories/drizzle-user.repository";

export const getProfile = new Elysia().use(auth).get("/me", async ({ getCurrentUser }) => {
  const { sub: userId } = await getCurrentUser();

  const userRepository = new DrizzleUserRepository();
  const getUserProfileUseCase = new GetUserProfileUseCase(userRepository);

  const user = await getUserProfileUseCase.execute({ userId });

  return user;
});