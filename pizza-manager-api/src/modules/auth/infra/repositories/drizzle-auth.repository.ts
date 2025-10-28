import { eq } from "drizzle-orm";
import { db } from "@/core/infra/db";
import { AuthLink, authLinks } from "@/modules/auth/domain/auth-link.entity";
import { IAuthLinkRepository } from "@/modules/auth/domain/auth-link.repository";

export class DrizzleAuthRepository implements IAuthLinkRepository {
  async create(authLink: Omit<AuthLink, 'id' | 'createdAt'>): Promise<AuthLink> {
    const [newAuthLink] = await db.insert(authLinks).values({
      userId: authLink.userId,
      code: authLink.code,
    }).returning();

    return newAuthLink;
  }

  async findByCode(code: string): Promise<AuthLink | null> {
    const [authLink] = await db
      .select()
      .from(authLinks)
      .where(eq(authLinks.code, code));

    return authLink || null;
  }

  async delete(code: string): Promise<void> {
    await db.delete(authLinks).where(eq(authLinks.code, code));
  }
}