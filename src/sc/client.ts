import { Parser } from '../utils/parser';
import { Client } from '../client';
import { logger } from '../utils/logger';
import { parseConfig } from './helper';

export const clientHandler = (yargs) => {
    yargs
        .usage('Usage: sc client [options]')
        .config('config', parseConfig)
        .options({
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
    argv.bridge = new argv.bridge();
    const config = { bridge: argv.bridge };
    const client = new Client(config);
    client.start();

}