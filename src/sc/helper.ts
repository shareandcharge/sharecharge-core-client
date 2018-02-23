import {Contract} from "../lib/src/services/contract";
import {TestContract} from "../lib/test/test-contract";
//import {Contract} from "../../../core-client-lib/src/services/contract";
//import {TestContract} from "../../../core-client-lib/test/test-contract";
import { Parser } from '../utils/parser';

import {config} from "../../config";

const PASS = process.env.PASS || "";

export const parseConfig = path => {
    const parser = new Parser();
    const confString = parser.read(path);
    const translation = parser.translate(confString);
    parser.write(translation);
    // console.log(require('../../config').config)
    // import config from '../../config';
    return require('../../config').config;
}

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