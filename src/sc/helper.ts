import * as path from 'path';
import * as fs from 'fs';

import {Contract} from "../lib/src/services/contract";
import {TestContract} from "../lib/test/test-contract";
import TestBridge from '../../test/testBridge1';
//import {Contract} from "../../../core-client-lib/src/services/contract";
//import {TestContract} from "../../../core-client-lib/test/test-contract";
import { Parser } from '../utils/parser';

export const customConfig = (filename) => {
    const confPath = path.join(process.cwd(), filename);
    return parseConfigFile(confPath);
}

export const initBridge = (filename) => {
    const config = customConfig(filename);
    const bridgePath = path.join(process.cwd(), config.bridge);
    const Bridge = require(bridgePath).default;
    return new Bridge();
}

export const parseConfigFile = path => {
    const parser = new Parser();
    const confString = parser.read(path);
    return parser.translate(confString);
}

export const createConfig = argv => {
    return {
        id: argv.id || '',
        pass: argv.pass || '',
        test: argv.test,
        statusInterval: argv['status-interval'] || 30000,
        connectors: checkConnectorPath(argv.connectors),
        bridge: configureBridge(argv.bridge)
    };
}

const checkConnectorPath = (connPath) => {
    try {
        const fullPath = path.join(process.cwd(), connPath);
        fs.statSync(fullPath);
        return require(fullPath);
    } catch (err) {
        return;
    }
}

const configureBridge = (bridge) => {
    try {
        return new bridge();
    } catch (err) {
        return new TestBridge();
    }
}

const config = customConfig('./conf.yaml');
const PASS = config.pass;

export const contractQueryState = (method, ...args) => {

    return new Promise((resolve, reject) => {

        const contract = config.test ? new TestContract() : new Contract(PASS);

        contract.queryState(method, ...args)
            .then((result) => resolve(result))
            .catch(e => {
                console.error(e.message);
                process.exit(0);
                return reject(e);
            });
    });
};

export const contractSendTx = (method, ...args) => {

    return new Promise((resolve, reject) => {

        const contract = config.test ? new TestContract() : new Contract(PASS);

        contract.sendTx(method, ...args)
            .then((result) => resolve(result))
            .catch(e => {
                console.error(e.message);
                process.exit(0);
                return reject(e);
            })
    });
};