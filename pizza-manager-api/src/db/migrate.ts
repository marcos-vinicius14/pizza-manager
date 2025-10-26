import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import logger from "../../logger";
import chalk from "chalk";


const connection = postgres(process.env.DATABASE_URL!, { max: 1 });

const db = drizzle(connection);

await migrate(db, { migrationsFolder: 'drizzle' });


logger.info(chalk.greenBright('Migrations applied successfully!'));
await connection.end();

process.exit(0);
