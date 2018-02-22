import { Client } from './src/client';
import { Parser } from './src/utils/parser';
import { logger } from './src/utils/logger';

let conf;

let ID = process.env.ID || '';
const PASS = process.env.PASS || '';

if (!ID) {
    logger.warn('Missing Environment Variable: ID')
}
if (!PASS) {
    logger.warn('Missing Environment Variable: PASS (Using empty PASS)');
}

const parser = new Parser();
const configString = parser.read(__dirname + '/conf.yaml');
const configTranslate = parser.translate(configString);
parser.write(configTranslate);

import { config } from './config';

config.id = ID;
config.pass = PASS;

if (config.connectors) {
    config.connectors = require(config.connectors);
}

const client = new Client(config);
client.start();