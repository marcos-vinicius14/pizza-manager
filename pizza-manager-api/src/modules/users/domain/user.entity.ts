import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { orders } from '@/modules/orders/domain/order.entity';
import { restaurants } from '@/modules/restaurants/domain/restaurant.entity';


export const userRoleEnum = pgEnum('user_role', ['manager', 'customer']);

export const user = pgTable('tb_users', {
    id: text('id').$defaultFn(() => createId()).primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    phone: text('phone').unique(),
    role: userRoleEnum('role').default('customer').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const userRelations = relations(user, ({ one, many }) => {
    return {
        orders: many(orders),
        managedRestaurant: one(restaurants, {
            fields: [user.id],
            references: [restaurants.managerId],
            relationName: 'user_managed_restaurant'
        })
    }
});

export type User = typeof user.$inferSelect;