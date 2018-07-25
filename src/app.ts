#!/usr/bin/env node

import * as yargs from 'yargs';
import { prepareConfigLocation, getConfigDir } from '@motionwerk/sharecharge-common';
import { CoreClient } from './coreClient';


yargs

    .command('start', 'Start the Share & Charge Core Client', (yargs: yargs.Argv) => {
        return yargs
        .option('api', {
            describe: 'Run the Share & Charge API',
            type: 'boolean',
        })
        // .default('no-api', u);
    }, (args: yargs.Arguments) => {
        const client = CoreClient.getInstance();
        client.main();
        if (args['api']) {
            require('@motionwerk/sharecharge-api');
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
