import { relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "@/modules/users/domain/user.entity";
import { createId } from "@paralleldrive/cuid2";

export const authLinks = pgTable('tb_auth_links', {
    id: text('id').$defaultFn(() => createId()).primaryKey(),
    code: text('code').notNull().unique(),
    userId: text('user_id').references(() => user.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type AuthLink = typeof authLinks.$inferSelect;
