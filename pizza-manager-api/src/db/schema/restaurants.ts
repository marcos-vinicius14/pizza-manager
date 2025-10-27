import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { user } from "./users";
import { relations } from "drizzle-orm";
import { orders } from "./order";
import { products } from "./products";

export const restaurants = pgTable('restaurants', {
    id: text('id').$defaultFn(() => createId()).primaryKey(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    phone: text('phone').unique(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    managerId: text('manager_id').references(() => user.id, {
        onDelete: 'set null',
    
    })

});


export const restaurantsRelations = relations(restaurants, ({ one, many }) => {
    return {
        manager: one(user, {
            fields: [restaurants.managerId],
            references: [user.id],
            relationName: 'restaurant_manager'
        }),
        orders: many(products),
        products: many(products)
    
    }
});