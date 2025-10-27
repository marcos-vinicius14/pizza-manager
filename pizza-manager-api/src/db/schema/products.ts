import { createId } from "@paralleldrive/cuid2";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { restaurants } from "./restaurants";
import { relations } from "drizzle-orm";
import  { orders } from "./order";
import { ordersItems } from "./order-items";
import  { user } from "./users";


export const products = pgTable('tb_products', {
    id: text('id').$defaultFn(() => createId()).primaryKey(),
    productName: text('product_name').notNull(),
    productDescription: text('product_description'),
    priceInCents: integer('price_in_cents').notNull(),
    restaurantId: text('restaurant_id')
        .notNull()
        .references(() => restaurants.id, {
        onDelete: 'cascade',
    }),
    creteadAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),

})

export const productsRelations = relations(products, ({ one, many }) => {
    return {
        customer: one(restaurants, {
            fields: [products.restaurantId],
            references: [restaurants.id],
            relationName: 'product_restaurant'
        }),
        
        items: many(ordersItems)
    
    }
});