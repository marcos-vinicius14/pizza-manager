import logger from "../../logger";
import chalk from 'chalk'
import { Elysia, t } from "elysia";
import { appRoutes } from "./routes";
import jwt from "@elysiajs/jwt";
import cookie from "@elysiajs/cookie";

const PORT = process.env.PORT || 3333;
const ENV = process.env.NODE_ENV || 'development';

const app = new Elysia()
  .use(appRoutes)
  .use(jwt({
    secret: process.env.JWT_SECRET_KEY!,
    schema: t.Object({
      sub: t.String(),
      restaurantId: t.Optional(t.String()),

    })
  }))
  .use(cookie());


app.listen(PORT, () => {
  logger.info(chalk.greenBright(`✓ Server running`));
  logger.info(chalk.gray(`  Port: ${PORT}`));
  logger.info(chalk.gray(`  Environment: ${ENV}`));
  logger.info(chalk.gray(`  URL: http://localhost:${PORT}`));
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  app.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  app.stop();
  process.exit(0);
});
