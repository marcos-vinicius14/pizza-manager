import { relations } from "drizzle-orm";
import { pgTable, text, integer } from "drizzle-orm/pg-core";
import { orders } from "@/modules/orders/domain/order.entity";
import { createId } from "@paralleldrive/cuid2";
import { products } from "@/modules/restaurants/domain/product.entity";

export const ordersItems = pgTable('tb_orders_items', {
    id: text('id').$defaultFn(() => createId()).primaryKey(),
    orderId: text('order_id').references(() => orders.id, { onDelete: 'cascade' }),
    productId: text('product_id').references(() => products.id, { onDelete: 'set null' }),
    priceInCents: integer('price_in_cents').notNull(),
    quantity: integer('quantity').notNull(),
});

export const orderItemsRelations = relations(ordersItems, ({ one }) => {
    return {
        order: one(orders, {
            fields: [ordersItems.orderId],
            references: [orders.id],
            relationName: 'order_item_order'
        }),
        product: one(products, {
            fields: [ordersItems.productId],
            references: [products.id],
            relationName: 'order_item_product'
        })
    }
});
