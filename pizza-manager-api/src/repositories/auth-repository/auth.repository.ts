import { eq } from "drizzle-orm"
import { db } from "../../db/connection"
import { authLinks, user } from "../../db/schema"
import type { User } from "../restaurant-repository/index";

export class AuthRepository {

  async findUserByEmail(email: string): Promise<User | null> {
    const [foundUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1)

    return foundUser ? (foundUser as User) : null
  }

  async createAuthLink(userId: string, code: string) {
    await db.insert(authLinks).values({
        userId: userId,
        code: code,
    })
  }

  async findAuthLinkByCode(code: string) {
    const [authLinkFromCode] = await db
      .select()
      .from(authLinks)
      .where(eq(authLinks.code, code))

    return authLinkFromCode
  }

  async deleteAuthLink(id: string) {
    await db
        .delete(authLinks)
        .where(eq(authLinks.id, id))
  }

}