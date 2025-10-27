import Elysia, { t } from "elysia";
import { auth } from "../auth";
import { orders } from "../../db/schema";
import { db } from "../../db/connection";
import { eq } from "drizzle-orm";



export const cancelOrder = new Elysia()
    .use(auth)
    .patch('/order/:id/cancel', async ({ getCurrentUser, set, params }) => {
        const { id } = params;

        const { restaurantId } = await getCurrentUser();

        if (!restaurantId) {
            throw new Error('Unauthorized');
        }

        const [order] = await db
            .select()
            .from(orders)
            .where(eq(orders.id, id));

        if (!order) {
            set.status = 400;
            return {
                success: false,
                message: 'Order not found'
            }
        }

        if (!['pending', 'processing'].includes(order.status)) {
            set.status = 400;
            return {
                success: false,
                message: 'You can only cancel orders that are in pending or processing status'
            }
        }

        await db
            .update(orders)
            .set({
                status: 'canceled'
            })
            .where(eq(orders.id, id));

        return {
            success: true,
            message: 'Order approved'
        }




    }, {
        params: t.Object({
            id: t.String(),
        })

    })
