import { Elysia } from "elysia";
import { restaurantRoutes } from "./restaurant.routes";
import { sendAuthLink } from "./send-auth-link";
import { authenticateFromLink } from "./authenticateFromLink";
import { signOut } from "./signOut";
import { auth } from "../auth";
import { getProfile } from "./get-profile";
import { getManagedRestaurant } from "./get-managed-restaurant";
import { getOrderDetails } from "./get-order-details";
import { approveOrder } from "./aprove-order";
import { deliverOrder } from "./deliver-order";
import { cancelOrder } from "./cancelled-order";
import { dispatchOrder } from "./dispatch-order";

export const appRoutes = new Elysia({ name: "appRoutes" })
  .use(auth)
  .use(restaurantRoutes)
  .use(sendAuthLink)
  .use(authenticateFromLink)
  .use(signOut)
  .use(getProfile)
  .use(getManagedRestaurant)
  .use(getOrderDetails)
  .use(approveOrder)
  .use(cancelOrder)
  .use(dispatchOrder)
  .use(deliverOrder)
  .onError(({ code, error, set }) => {
    switch (code) {
      case "VALIDATION":
        set.status = error.status;
        return {
          code,
          message: "Validation error",
          details: error.message,
        };
      default: {
        set.status = 500;
        return {
          code,
          message: "Internal Server Error",
        };
      }
    }
  });