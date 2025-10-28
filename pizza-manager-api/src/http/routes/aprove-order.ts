import Elysia, { t } from "elysia";
import { auth } from "../auth";
import { OrderService } from "../../services/order/order.service";
import { OrderRepository } from "../../repositories/order.repository";

export const aproveOrder = new Elysia()
    .use(auth)
    .patch('/order/:id/approve', async ({ getCurrentUser, set, params }) => {
        const { id } = params;
        const { restaurantId } = await getCurrentUser();

        const orderRepository = new OrderRepository();
        const orderService = new OrderService(orderRepository);

        try {
            await orderService.approveOrder(id, restaurantId as string);
            set.status = 204;
        } catch (error: any) {
            set.status = 400;
            return {
                success: false,
                message: error.message
            };
        }
    }, {
        params: t.Object({
            id: t.String(),
        })
    });
