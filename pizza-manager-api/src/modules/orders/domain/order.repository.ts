import { Order } from './order.entity'

export type OrderStatus = | 'pending' | 'processing' | 'delivering' | 'delivered' | 'canceled'

export interface IOrderRepository {
  create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order>
  updateStatus(orderId: string, status: OrderStatus): Promise<void>
  findById(orderId: string): Promise<Order | null>
}
