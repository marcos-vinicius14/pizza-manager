import logger from "../../logger";
import chalk from 'chalk'
import { RestaurantService } from "../services/restaurant.service";
import { RestaurantRepository } from "../repositories/restaurant.repository";
import { createRoutes } from "./routes";

const PORT = process.env.PORT || 3333;
const ENV = process.env.NODE_ENV || 'development';

const restaurantRepository = new RestaurantRepository();
const restaurantService = new RestaurantService(restaurantRepository);

const app = createRoutes(restaurantService);

// Middleware de erro global
app.onError(({ code, error, set }) => {
  logger.error(chalk.redBright(`✗ Error: ${error}, with code: ${code}`));
  
  if (code === 'VALIDATION') {
    set.status = 400;
    return { 
      success: false,
      error: 'Dados inválidos',
      details: error.message 
    };
  }
  
  if (code === 'NOT_FOUND') {
    set.status = 404;
    return { 
      success: false,
      error: 'Recurso não encontrado' 
    };
  }
  
  // Erro genérico
  set.status = 500;
  return { 
    success: false,
    error: ENV === 'production' 
      ? 'Erro interno do servidor' 
      : error 
  };
});

app.listen(PORT, () => {
  logger.info(chalk.greenBright(`✓ Server running`));
  logger.info(chalk.gray(`  Port: ${PORT}`));
  logger.info(chalk.gray(`  Environment: ${ENV}`));
  logger.info(chalk.gray(`  URL: http://localhost:${PORT}`));
});

// Graceful shutdown
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