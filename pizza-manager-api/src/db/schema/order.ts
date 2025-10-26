import { createId } from "@paralleldrive/cuid2";
import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./users";


export const orderStatusEnum = pgEnum('order_status', [
    'pending',
    'processing',
    'delivering',
    'delivered',
    'canceled'
]);

export const orders = pgTable('tb_orders', {
    id: text('id').$defaultFn(() => createId()).primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    customerId: text('customer_id')
        .references(() => user.id, {
        onDelete: 'set null',
    }),
    restaurantId: text('restaurant_id')
        .notNull()
        .references(() => user.id, {
        onDelete: 'cascade',
    }),
    status: orderStatusEnum('status')
        .default('pending')
        .notNull(),
    totalOrderInCents: integer('total_order_in_cents').notNull(),
})