import { eq } from "drizzle-orm";
import { db } from "../db/connection";
import { orders, user, ordersItems, products } from "../db/schema";

export class OrderRepository {
    async findDetailsById(orderId: string) {
        const orderResults = await db
            .select({
                orderId: orders.id,
                orderStatus: orders.status,
                orderTotal: orders.totalOrderInCents,
                orderCreatedAt: orders.createdAt,
                customer: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                },
                orderItem: {
                    id: ordersItems.id,
                    quantity: ordersItems.quantity,
                    priceInCents: ordersItems.priceInCents,
                },
                product: {
                    id: products.id,
                    name: products.productName,
                    description: products.productDescription,
                    priceInCents: products.priceInCents,
                }
            })
            .from(orders)
            .leftJoin(user, eq(orders.customerId, user.id))
            .leftJoin(ordersItems, eq(ordersItems.orderId, orders.id))
            .leftJoin(products, eq(ordersItems.productId, products.id))
            .where(eq(orders.id, orderId));

        return orderResults;
    }

    async findById(orderId: string) {
        const [order] = await db
            .select()
            .from(orders)
            .where(eq(orders.id, orderId));

        return order;
    }

    async updateStatus(orderId: string, status: string) {
        await db
            .update(orders)
            .set({
                status: status as 'pending' | 'processing' | 'delivering' | 'delivered' | 'canceled'
            })
            .where(eq(orders.id, orderId));
    }
}
