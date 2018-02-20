import {Contract} from "../lib/src/services/contract";
import {TestContract} from "../lib/test/test-contract";
//import {Contract} from "../../../core-client-lib/src/services/contract";
//import {TestContract} from "../../../core-client-lib/test/test-contract";

import {config} from "../../config";

const PASS = process.env.PASS || "";

export const contractQueryState = (method, ...args) => {

    return new Promise((resolve, reject) => {

        const contract = config.test ? new TestContract() : new Contract(PASS);

        contract.queryState(method, ...args)
            .then((result) => resolve(result))
            .catch(e => {
                console.error(e);
                process.exit(1);
            });
    });
};

export const contractSendTx = (method, ...args) => {

    return new Promise((resolve, reject) => {

        const contract = config.test ? new TestContract() : new Contract(PASS);

        contract.sendTx(method, ...args)
            .then((result) => resolve(result))
            .catch(e => {
                console.error(e);
                process.exit(1);
            })
    });
};