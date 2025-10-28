import chalk from 'chalk';
import logger from '../../../logger';
import { OrderRepository } from '../../repositories/order.repository';

export class OrderService {
    constructor(private orderRepository: OrderRepository) { }

    async getOrderDetails(orderId: string, restaurantId: string) {
        if (!restaurantId) {
            throw new Error('Unauthorized');
        }

        const orderResults = await this.orderRepository.findDetailsById(orderId);

        if (!orderResults || orderResults.length === 0) {
            throw new Error('Order not found');
        }

        const order = {
            id: orderResults[0]?orderId,
            status: orderResults[0]?.orderStatus,
            totalInCents: orderResults[0]?.orderTotal,
            createdAt: orderResults[0]?.orderCreatedAt,
            customer: orderResults[0]?.customer,
            orderItems: orderResults.map(row => ({
                id: row.orderItem?.id,
                priceInCents: row.orderItem?.priceInCents,
                quantity: row.orderItem?.quantity,
                product: row.product,
            })),
        };

        return order;
    }

    async approveOrder(orderId: string, restaurantId: string) {
        if (!restaurantId) {
            throw new Error('Unauthorized');
        }

        const order = await this.orderRepository.findById(orderId);

        if (!order) {
            logger.error(chalk.redBright('Order not found'))
            throw new Error('Order not found');
        }

        if (order.status !== 'pending') {
            throw new Error('Order is not in a pending state');
        }

        await this.orderRepository.updateStatus(orderId, 'processing');
    }

    async cancelOrder(orderId: string, restaurantId: string) {
        if (!restaurantId) {
            throw new Error('Unauthorized');
        }

        const order = await this.orderRepository.findById(orderId);

        if (!order) {
            throw new Error('Order not found');
        }

        if (!['pending', 'processing'].includes(order.status)) {
            throw new Error('Order cannot be canceled at its current stage.');
        }

        await this.orderRepository.updateStatus(orderId, 'canceled');
    }

    async dispatchOrder(orderId: string, restaurantId: string) {
        if (!restaurantId) {
            throw new Error('Unauthorized');
        }

        const order = await this.orderRepository.findById(orderId);

        if (!order) {
            throw new Error('Order not found');
        }

        if (order.status !== 'processing') {
            throw new Error('Order cannot be dispatched from its current state.');
        }

        await this.orderRepository.updateStatus(orderId, 'delivering');
    }

    async deliverOrder(orderId: string, restaurantId: string) {
        if (!restaurantId) {
            throw new Error('Unauthorized');
        }

        const order = await this.orderRepository.findById(orderId);

        if (!order) {
            throw new Error('Order not found');
        }

        if (order.status !== 'delivering') {
            throw new Error('Order cannot be marked as delivered from its current state.');
        }

        await this.orderRepository.updateStatus(orderId, 'delivered');
    }
}
