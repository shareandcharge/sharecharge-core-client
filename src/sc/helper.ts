import * as path from 'path';
import * as fs from 'fs';

import {Contract} from "../../lib/src/services/contract";
import {TestContract} from "../../lib/test/test-contract";

import {Parser} from '../utils/parser';
import TestBridge from '../../test/testBridge1';

export const customConfig = (filename) => {
    const confPath = path.join(process.cwd(), filename);
    return parseConfigFile(confPath);
};

export const parseConfigFile = path => {
    const parser = new Parser();
    const confString = parser.read(path);
    return parser.translate(confString);
};

export const createConfig = argv => {
    return {
        id: argv.id,
        pass: argv.pass,
        test: argv.test,
        statusInterval: argv['status-interval'],
        connectors: checkConnectorPath(argv.connectors),
        bridge: configureBridge(argv.bridge)
    };
};

const checkConnectorPath = (connPath) => {
    try {
        const fullPath = path.join(process.cwd(), connPath);
        fs.statSync(fullPath);
        return require(fullPath);
    } catch (err) {
        // console.log(err);
        return;
    }
};

const configureBridge = (bridge) => {
    try {
        return new bridge();
    } catch (err) {
        return new TestBridge();
    }
};

export const initBridge = (filename) => {
    const config = customConfig(filename);
    const bridgePath = path.join(process.cwd(), config.bridge);
    const Bridge = require(bridgePath).default;
    return new Bridge();
};

export const getCoinbase = async () => {
    const config = customConfig('./conf.yaml');
    const contract = config.test ? new TestContract() : new Contract(config.pass);
    return await contract.getCoinbase();
};

export const contractQueryState = (method, ...args) => {
    const config = customConfig('./conf.yaml');

    return new Promise((resolve, reject) => {

        const contract = config.test ? new TestContract() : new Contract(config.pass);

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
    const config = customConfig('./conf.yaml');

    return new Promise((resolve, reject) => {

        const contract = config.test ? new TestContract() : new Contract(config.pass);

        contract.sendTx(method, ...args)
            .then((result) => resolve(result))
            .catch(e => {
                console.error(e.message);
                process.exit(0);
                return reject(e);
            })
    });
};