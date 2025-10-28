
import { IOrderRepository } from "../../domain/order.repository";

interface DispatchOrderUseCaseRequest {
  orderId: string;
}

export class DispatchOrderUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute({ orderId }: DispatchOrderUseCaseRequest): Promise<void> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new Error("Order not found.");
    }

    if (order.status !== "processing") {
      throw new Error("Order cannot be dispatched from its current state.");
    }

    await this.orderRepository.updateStatus(orderId, "delivering");
  }
}
