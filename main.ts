import { Parser } from './src/utils/parser';
import { Client } from './src/client';
import { logger } from './src/utils/logger';
import { Bridge } from './test/testBridge1';

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

conf = config.bridge ? config : { bridge: new Bridge() };
conf.id = ID;
conf.pass = PASS;

console.log(require(config.connectors));

const client = new Client(conf);
client.start();