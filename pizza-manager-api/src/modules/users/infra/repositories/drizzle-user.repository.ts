import { eq } from "drizzle-orm";
import { db } from "@/core/infra/db";
import { User, user } from "@/modules/users/domain/user.entity";
import { IUserRepository } from "@/modules/users/domain/user.repository";

export class DrizzleUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const [foundUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, email));

    return foundUser || null;
  }

  async findById(id: string): Promise<User | null> {
    const [foundUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, id));

    return foundUser || null;
  }

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const [newUser] = await db.insert(user).values(userData).returning();

    return newUser;
  }
}
