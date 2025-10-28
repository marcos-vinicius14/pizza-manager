import { relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "@/modules/users/domain/user.entity";
import { createId } from "@paralleldrive/cuid2";
import { products } from "@/modules/restaurants/domain/product.entity";

export const restaurants = pgTable('tb_restaurants', {
    id: text('id').$defaultFn(() => createId()).primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    managerId: text('manager_id').references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const restaurantRelations = relations(restaurants, ({ one, many }) => {
    return {
        manager: one(user, {
            fields: [restaurants.managerId],
            references: [user.id],
            relationName: 'restaurant_manager'
        }),
        products: many(products)
    }
});

export type Restaurant = typeof restaurants.$inferSelect;
