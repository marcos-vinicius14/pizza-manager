
import Elysia, { t } from "elysia";
import { auth } from "@/http/auth";
import { ApproveOrderUseCase } from "@/modules/orders/application/use-cases/approve-order.use-case";
import { DrizzleOrderRepository } from "@/modules/orders/infra/repositories/drizzle-order.repository";

export const approveOrder = new Elysia().use(auth).patch(
  "/orders/:orderId/approve",
  async ({ getCurrentUser, set, params }) => {
    const { orderId } = params;
    const { restaurantId } = await getCurrentUser();

    if (!restaurantId) {
      set.status = 401;
      return { message: "User is not a manager of any restaurant." };
    }

    const orderRepository = new DrizzleOrderRepository();
    const approveOrderUseCase = new ApproveOrderUseCase(orderRepository);

    try {
      await approveOrderUseCase.execute({ orderId });
      set.status = 204;
    } catch (error: any) {
      set.status = 400;
      return {
        success: false,
        message: error.message,
      };
    }
  },
  {
    params: t.Object({
      orderId: t.String(),
    }),
  }
);
