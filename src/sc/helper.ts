import * as path from 'path';
import * as fs from 'fs';
import { Contract, TestContract } from 'sharecharge-lib';
import { Parser } from '../utils/parser';
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

const defaultConfig = customConfig('./conf.yaml');

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
    const contract = defaultConfig.test ?
        new TestContract() : new Contract({pass: defaultConfig.pass});
    return contract.getCoinbase();
};

export const contractQueryState = (method, ...args) => {

    return new Promise((resolve, reject) => {

        const contract = defaultConfig.test ?
            new TestContract() : new Contract({pass: defaultConfig.pass});

        contract.queryState(method, ...args)
            .then((result) => resolve(result))
            .catch(e => {

                console.log("Method", method, ...args);
                console.error(e.message);
                console.error(e.stack);

                process.exit(0);
                return reject(e);
            });
    });
};

export const contractSendTx = (method, ...args) => {


    return new Promise((resolve, reject) => {

        const contract = defaultConfig.test ?
            new TestContract() : new Contract({pass: defaultConfig.pass});

        contract.sendTx(method, ...args)
            .then((result) => resolve(result))
            .catch(e => {
                console.error(e.message);
                process.exit(0);
                return reject(e);
            })
    });
};