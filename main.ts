import { config } from './config';
import { Client } from './src/index';
import { logger } from './src/utils/logger';

let ID = process.env.ID || '';
const PASS = process.env.PASS || '';

if (!ID) {
    logger.warn('Missing Environment Variable: ID')
}
if (!PASS) {
    logger.warn('Missing Environment Variable: PASS (Using empty PASS)');
}

const client = new Client(config, ID, PASS);
client.start();