import { createId } from "@paralleldrive/cuid2";
import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { restaurants } from "./restaurants";


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
})