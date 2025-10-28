
import { IOrderRepository } from "../../domain/order.repository";

interface CancelOrderUseCaseRequest {
  orderId: string;
}

export class CancelOrderUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute({ orderId }: CancelOrderUseCaseRequest): Promise<void> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new Error("Order not found.");
    }

    if (!["pending", "processing"].includes(order.status)) {
      throw new Error("Order cannot be canceled at its current stage.");
    }

    await this.orderRepository.updateStatus(orderId, "canceled");
  }
}
