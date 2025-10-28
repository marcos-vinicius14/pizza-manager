import Elysia, { t } from "elysia";
import { auth } from "../auth";
import { OrderService } from "../../services/order/order.service";
import { OrderRepository } from "../../repositories/order.repository";

export const dispatchOrder = new Elysia()
    .use(auth)
    .patch('/order/:id/dispatch', async ({ getCurrentUser, set, params }) => {
        const { id } = params;
        const { restaurantId } = await getCurrentUser();

        const orderRepository = new OrderRepository();
        const orderService = new OrderService(orderRepository);

        try {
            await orderService.dispatchOrder(id, restaurantId as string);
            set.status = 204; // Success, no content
        } catch (error: any) {
            set.status = 400; // Bad Request
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
