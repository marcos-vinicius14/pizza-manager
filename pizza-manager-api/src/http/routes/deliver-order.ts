
import Elysia, { t } from "elysia";
import { auth } from "@/http/auth";
import { DeliverOrderUseCase } from "@/modules/orders/application/use-cases/deliver-order.use-case";
import { DrizzleOrderRepository } from "@/modules/orders/infra/repositories/drizzle-order.repository";

export const deliverOrder = new Elysia().use(auth).patch(
  "/orders/:orderId/deliver",
  async ({ getCurrentUser, set, params }) => {
    const { orderId } = params;
    const { restaurantId } = await getCurrentUser();

    if (!restaurantId) {
      set.status = 401;
      return { message: "User is not a manager of any restaurant." };
    }

    const orderRepository = new DrizzleOrderRepository();
    const deliverOrderUseCase = new DeliverOrderUseCase(orderRepository);

    try {
      await deliverOrderUseCase.execute({ orderId });
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
