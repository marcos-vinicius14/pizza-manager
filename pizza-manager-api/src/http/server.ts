import { Elysia } from "elysia";
import logger from "../../logger";

const app = new Elysia()
    .get('/', () => {
        return 'Hello world'
    });

app.listen(3333, () => {
    logger.info('Server is running');
});