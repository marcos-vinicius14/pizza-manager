
import { IOrderRepository } from "../../domain/order.repository";

// This is a simplified version. In a real scenario, this would probably use a
// dedicated query service or a read-model repository to avoid complex joins
// in the use case.

interface GetOrderDetailsUseCaseRequest {
  orderId: string;
}

export class GetOrderDetailsUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute({ orderId }: GetOrderDetailsUseCaseRequest): Promise<any> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new Error("Order not found.");
    }

    // This is a placeholder. The detailed query logic from the original
    // service would be adapted here, ideally through a dedicated query service.
    return order;
  }
}
