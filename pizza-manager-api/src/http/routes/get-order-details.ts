import Elysia, { t } from "elysia";
import { auth } from "@/http/auth";
import { GetOrderDetailsUseCase } from "@/modules/orders/application/use-cases/get-order-details.use-case";
import { DrizzleOrderRepository } from "@/modules/orders/infra/repositories/drizzle-order.repository";

export const getOrderDetails = new Elysia().use(auth).get(
  "/orders/:orderId",
  async ({ getCurrentUser, params, set }) => {
    const { orderId } = params;
    const { restaurantId } = await getCurrentUser();

    if (!restaurantId) {
      set.status = 401;
      return { message: "User is not a manager of any restaurant." };
    }

    const orderRepository = new DrizzleOrderRepository();
    const getOrderDetailsUseCase = new GetOrderDetailsUseCase(orderRepository);

    try {
      const order = await getOrderDetailsUseCase.execute({ orderId });
      return order;
    } catch (error: any) {
      set.status = 404;
      return { message: error.message };
    }
  },
  {
    params: t.Object({
      orderId: t.String(),
    }),
  }
);