
import Elysia, { t } from "elysia";
import { auth } from "@/http/auth";
import { CancelOrderUseCase } from "@/modules/orders/application/use-cases/cancel-order.use-case";
import { DrizzleOrderRepository } from "@/modules/orders/infra/repositories/drizzle-order.repository";

export const cancelOrder = new Elysia().use(auth).patch(
  "/orders/:orderId/cancel",
  async ({ getCurrentUser, set, params }) => {
    const { orderId } = params;
    const { restaurantId } = await getCurrentUser();

    if (!restaurantId) {
      set.status = 401;
      return { message: "User is not a manager of any restaurant." };
    }

    const orderRepository = new DrizzleOrderRepository();
    const cancelOrderUseCase = new CancelOrderUseCase(orderRepository);

    try {
      await cancelOrderUseCase.execute({ orderId });
      set.status = 204;
    } catch (error: any) {
      set.status = 400;
      return { message: error.message };
    }
  },
  {
    params: t.Object({
      orderId: t.String(),
    }),
  }
);
