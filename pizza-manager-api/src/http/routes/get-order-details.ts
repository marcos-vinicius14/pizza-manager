import Elysia, { t} from "elysia";
import { auth } from "../auth";
import logger from "../../../logger";
import chalk from "chalk";
import { db } from "../../db/connection";
import  { eq } from "drizzle-orm";
import  { orders, user, ordersItems, products } from "../../db/schema";

export const getOrderDetails = new Elysia()
    .use(auth)
    .get('/order/:id', async ({ params, getCurrentUser, set }) => {
        const { id } = params;

        const { restaurantId } = await getCurrentUser();

        if (!restaurantId) {
            logger.error(chalk.redBright(`✗  Unauthorized`))
            throw new Error('Unauthorized');
        }

        const orderResults = await db
          .select({
            orderId: orders.id,
            orderStatus: orders.status,
            orderTotal: orders.totalOrderInCents,
            orderCreatedAt: orders.createdAt,
            customer: {
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
            },
            orderItem: {
              id: ordersItems.id,
              quantity: ordersItems.quantity,
              priceInCents: ordersItems.priceInCents,
            },
            product: {
              id: products.id,
              name: products.productName,
              description: products.productDescription,
              priceInCents: products.priceInCents,
            }
          })
          .from(orders)
          .leftJoin(user, eq(orders.customerId, user.id))
          .leftJoin(ordersItems, eq(ordersItems.orderId, orders.id))
          .leftJoin(products, eq(ordersItems.productId, products.id))
          .where(eq(orders.id, id));

        if(!orderResults) {
            logger.error(chalk.redBright(`✗  Order not found`))
            set.status = 400;

            return {
                success: false,
                message: 'Order not found'
            }
            
        }



        return {}
    }, {
        params: t.Object({
            id: t.String(),
        })
    
    
    })