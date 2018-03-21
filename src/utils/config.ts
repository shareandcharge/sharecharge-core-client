import * as path from 'path';
import * as fs from 'fs';
import Parser from './parser';
import IClientConfig from "../models/iClientConfig"

/**
 * loads config from filesystem and parses it depending on the format
 * @param {string} filename
 * @returns {any}
 */
export const loadConfigFromFile = (filename: string): IClientConfig => {
    const confPath = filename.startsWith("/") ? filename : path.join(process.cwd(), filename);
    const parser = new Parser();
    const confString = parser.read(confPath);
    return <IClientConfig>createConfig(parser.translate(confString))
};

/**
 * ?? converts from one format to the other?
 * @param argv
 */
export const createConfig = (argv: any) => {
    return {
        id: argv.id,
        pass: argv.pass,
        stage: argv.stage,
        seed: argv.seed,
        gasPrice: argv.gasPrice,
        provider: argv.provider,
        statusInterval: argv['status-interval'],
        connectors: loadConnectorsFromPath(argv.connectors),
        bridge: createBrideInstance(argv.bridge)
    };
};

/**
 *
 * @param connPath
 * @returns {any}
 */
const loadConnectorsFromPath = (connPath) => {

    try {
        const fullPath = path.join(process.cwd(), connPath);
        fs.statSync(fullPath);
        return require(fullPath);
    } catch (err) {
        // console.log(err);
        return;
    }
};

/**
 *
 * @param {string} bridgeName
 */
const createBrideInstance = (bridgeName: string) => {
    const bridgePath = path.join(process.cwd(), bridgeName);
    const Bridge = require(bridgePath).default;
    return new Bridge();
};