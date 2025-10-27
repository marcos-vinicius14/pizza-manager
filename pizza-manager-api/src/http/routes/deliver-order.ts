import Elysia, { t } from "elysia";
import { auth } from "../auth";
import { orders } from "../../db/schema";
import { db } from "../../db/connection";
import { eq } from "drizzle-orm";



export const deliverOrder = new Elysia()
    .use(auth)
    .patch('/order/:id/delivere', async ({ getCurrentUser, set, params }) => {
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

        if (order.status != 'delivering') {
            set.status = 400;
            return {
                success: false,
                message: 'You cannot deliver an order that is not in delivering status'
            }
        }

        await db
            .update(orders)
            .set({
                status: 'delivered'
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
