import { logger } from '../utils/logger';
import { loadConfigFromFile } from '../utils/config';

export const clientHandler = (yargs) => {
    yargs
        .usage('Usage: sc client [options]')
        .config('config', 'Path to plaintext config file', loadConfigFromFile)
        .options({
            'id': {
                describe: 'The client ID used to filter EV charge requests',
                type: 'string'
            },
            'pass': {
                describe: 'The password of the user\'s Ethereum address for confirming charge sessions',
                type: 'string',
                default: ''
            },
            'bridge': {
                describe: 'Path to the bridge which the Core Client should connect to',
                type: 'string'
            },
            'connectors': {
                describe: 'Path to the connector data if registration of connectors required',
                type: 'string'
            },
            'stage': {
                describe: 'Specify on what stage we want to be',
                type: 'string'
            },
            'status-interval': {
                describe: 'Specify interval between connector status updates from bridge',
                type: 'number',
                default: 30000
            }
        })
};

export const clientStarter = (argv) => {

    const config = argv.config ? argv : loadConfigFromFile("./config/config.yaml");

    if (!config.id) {
        logger.warn('No Client ID found in configuration!');
    }

    if (!config.pass) {
        logger.warn('No Ethereum password found in configuration!');
    }

};