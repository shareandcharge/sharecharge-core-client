#!/usr/bin/env node

import * as yargs from 'yargs';
import { prepareConfigLocation, getConfigDir } from '@motionwerk/sharecharge-common';
import api from '@motionwerk/sharecharge-api';
import { CoreClient } from './coreClient';


yargs

    .command('start', 'Start the Share & Charge Core Client', (yargs: yargs.Argv) => {
        return yargs
        .option('api', {
            describe: 'Run the Share & Charge API',
            type: 'boolean',
        })
        .option('api-host', {
            describe: 'Configure API host to listen on',
            type: 'string',
            default: '127.0.0.1'
        })
        .option('api-port', {
            describe: 'Configure API port to listen on',
            type: 'number',
            default: 3000
        })
        // .default('no-api', u);
    }, (args: yargs.Arguments) => {
        const client = CoreClient.getInstance();
        client.main();
        if (args.api) {
            api(args['api-host'], args['api-port']);
        }
    })
    
    .command('init', 'Initialize the Share & Charge Core Client', {}, () => {
        prepareConfigLocation();
        console.log('Initialized Share&Charge Core Client at', getConfigDir());
    })
    
    .alias('v', 'version')
    .version(require('../package').version )
    .describe('v', 'show version information')
    
    .alias('h', 'help')
    .help('help')
    .usage('Usage: $0 [command]')
    
    .showHelpOnFail(false, "Specify --help for available options")
    .argv;
