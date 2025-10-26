import { createId } from "@paralleldrive/cuid2";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./users";
import { orders } from "./order";



export const ordersItems = pgTable('tb_orders_items', {
    id: text('id').$defaultFn(() => createId()).primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    orderId: text('order_id')
        .notNull()
        .references(() => orders.id, {
        onDelete: 'cascade',
    }),
    productId: text('product_id')
        .references(() => user.id, {
        onDelete: 'set null',
    }),
    priceInCents: integer('total_order_in_cents').notNull(),
    quantity: integer('quantity').notNull(),

})