import { eq } from "drizzle-orm";
import { db } from "../db/connection";
import { user } from "../db/schema";

export class UserRepository {
    async findById(id: string) {
        const currentUser = await db
            .select()
            .from(user)
            .where(eq(user.id, id));

        return currentUser[0];
    }
}
