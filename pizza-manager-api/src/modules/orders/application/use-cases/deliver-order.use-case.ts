
import { IOrderRepository } from "../../domain/order.repository";

interface DeliverOrderUseCaseRequest {
  orderId: string;
}

export class DeliverOrderUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute({ orderId }: DeliverOrderUseCaseRequest): Promise<void> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new Error("Order not found.");
    }

    if (order.status !== "delivering") {
      throw new Error("Order cannot be marked as delivered from its current state.");
    }

    await this.orderRepository.updateStatus(orderId, "delivered");
  }
}
