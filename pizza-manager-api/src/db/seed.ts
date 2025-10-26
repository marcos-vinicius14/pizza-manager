/* eslint-disable */

import { faker } from '@faker-js/faker';
import { user, restaurants } from './schema'
import { db } from './connection';
import chalk from 'chalk';
import logger from '../../logger';

await db.delete(user);
await db.delete(restaurants);
logger.info(chalk.yellow('Database reset with sucessfull!'));


await db.insert(user).values([
    {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
    },
    {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
    },
]);

logger.info(chalk.yellow('Customers created with successfull!'));

const [manager] = await db.insert(user).values([
    {
        name: faker.person.fullName(),
        email: 'marcos@gmail.com',
        phone: faker.phone.number(),
        userRole: 'manager'

    }
]).returning({
    id: user.id
});

logger.info(chalk.yellow('Managers created with successfull!'));


await db.insert(restaurants).values([
    {
        name: faker.company.name(),
        description: faker.lorem.paragraph(),
        phone: faker.phone.number(),
        managerId: manager!.id
    }
]);

logger.info(chalk.yellow('Restaurants created with successfull!'));
logger.info(chalk.greenBright('Database seeded sucessfully!'));

process.exit(0);



