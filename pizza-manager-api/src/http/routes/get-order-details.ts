import Elysia, { t } from "elysia";
import { auth } from "../auth";
import { OrderRepository } from "../../repositories/order.repository";
import { OrderService } from "../../services/order/order.service";

export const getOrderDetails = new Elysia()
    .use(auth)
    .get('/order/:id', async ({ params, getCurrentUser, set }) => {
        const { id } = params;
        const { restaurantId } = await getCurrentUser();

        const orderRepository = new OrderRepository();
        const orderService = new OrderService(orderRepository);

        try {
            const order = await orderService.getOrderDetails(id, restaurantId as string);
            return order;
        } catch (error: any) {
            set.status = 404; // Not Found
            return { success: false, message: error.message };
        }
    }, {
        params: t.Object({
            id: t.String(),
        })
    });