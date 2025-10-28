
import { IOrderRepository } from "../../domain/order.repository";

interface ApproveOrderUseCaseRequest {
  orderId: string;
}

export class ApproveOrderUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute({ orderId }: ApproveOrderUseCaseRequest): Promise<void> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new Error("Order not found.");
    }

    if (order.status !== "pending") {
      throw new Error("Order cannot be approved.");
    }

    await this.orderRepository.updateStatus(orderId, "processing");
  }
}
