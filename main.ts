import { config } from './config';
import { Client } from './src/index';
import { logger } from './src/utils/logger';
import { Bridge } from './test/testBridge1';

let ID = process.env.ID || '';
const PASS = process.env.PASS || '';

if (!ID) {
    logger.warn('Missing Environment Variable: ID')
}
if (!PASS) {
    logger.warn('Missing Environment Variable: PASS (Using empty PASS)');
}

const conf = config.bridge ? config : { bridge: new Bridge() };

const client = new Client(conf, ID, PASS);
client.start();