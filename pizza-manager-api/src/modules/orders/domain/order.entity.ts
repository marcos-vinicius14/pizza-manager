import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { user } from "@/modules/users/domain/user.entity";
import { createId } from "@paralleldrive/cuid2";
import { ordersItems } from "@/modules/orders/domain/order-item.entity";
import { restaurants } from "@/modules/restaurants/domain/restaurant.entity";

export const orderStatusEnum = pgEnum('order_status', ['pending', 'processing', 'delivering', 'delivered', 'canceled']);

export const orders = pgTable('tb_orders', {
    id: text('id').$defaultFn(() => createId()).primaryKey(),
    customerId: text('customer_id').references(() => user.id, { onDelete: 'set null' }),
    restaurantId: text('restaurant_id').references(() => restaurants.id, { onDelete: 'cascade' }),
    status: orderStatusEnum('status').default('pending').notNull(),
    totalOrderInCents: integer('total_order_in_cents').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const orderRelations = relations(orders, ({ one, many }) => {
    return {
        customer: one(user, {
            fields: [orders.customerId],
            references: [user.id],
            relationName: 'order_customer'
        }),
        restaurant: one(restaurants, {
            fields: [orders.restaurantId],
            references: [restaurants.id],
            relationName: 'order_restaurant'
        }),
        orderItems: many(ordersItems)
    }
});

export type Order = typeof orders.$inferSelect;
