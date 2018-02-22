import { Parser } from '../utils/parser';
import { Client } from '../client';
import { logger } from '../utils/logger';

/*
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

const client = new Client(conf, ID, PASS);
client.start();
*/

export const clientHandler = (yargs) => {
    yargs
        .usage('Usage: sc client [options]')
        .options({
            'config': {
                describe: 'Specify a configuration file to use',
                type: 'string'
            },
            'id': {
                describe: 'The client ID used to filter EV charge requests',
                type: 'string'
            },
            'pass': {
                describe: 'The password of the user\'s Ethereum address for confirming charge sessions',
                type: 'string'
            },
            'bridge': {
                describe: 'Path to the bridge which the Core Client should connect to',
                type: 'string'
            },
            'connectors': {
                describe: 'Path to the connector data if registration of connectors required',
                type: 'string'
            },
            'test': {
                describe: 'Use a mock S&C EV ChargingStation contract',
                type: 'boolean'
            },
            'status-update-interval': {
                describe: 'Specify interval between connector status updates from bridge',
                type: 'number'
            }
        })
}

export const clientStarter = (argv) => {

    let config = {
        config: argv.config,
        id: argv.id,
        pass: argv.pass,
        bridge: argv.bridge,
        connectors: argv.connectors,
        test: argv.test,
        'status-update-interval': argv['status-update-interval'],
    }

    console.log('Running the core client with args:', config);
}