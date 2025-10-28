
import Elysia, { t } from "elysia";
import { auth } from "@/http/auth";
import { DispatchOrderUseCase } from "@/modules/orders/application/use-cases/dispatch-order.use-case";
import { DrizzleOrderRepository } from "@/modules/orders/infra/repositories/drizzle-order.repository";

export const dispatchOrder = new Elysia().use(auth).patch(
  "/orders/:orderId/dispatch",
  async ({ getCurrentUser, set, params }) => {
    const { orderId } = params;
    const { restaurantId } = await getCurrentUser();

    if (!restaurantId) {
      set.status = 401;
      return { message: "User is not a manager of any restaurant." };
    }

    const orderRepository = new DrizzleOrderRepository();
    const dispatchOrderUseCase = new DispatchOrderUseCase(orderRepository);

    try {
      await dispatchOrderUseCase.execute({ orderId });
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
