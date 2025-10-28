import { eq } from "drizzle-orm";
import { db } from "@/core/infra/db";
import { Order, orders } from "@/modules/orders/domain/order.entity";
import { IOrderRepository, OrderStatus } from "@/modules/orders/domain/order.repository";

export class DrizzleOrderRepository implements IOrderRepository {
  async create(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(orderData).returning();
    return newOrder;
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<void> {
    await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, orderId));
  }

  async findById(orderId: string): Promise<Order | null> {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId));

    return order || null;
  }
}
