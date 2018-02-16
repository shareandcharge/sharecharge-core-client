import { Contract } from "./lib/src/services/contract";
import { TestContract } from "./lib/test/test-contract";
import * as commander from "commander";

import { config } from "../config";

const ID = process.env.ID || '';
const PASS = process.env.PASS || '';


commander
    .version("0.1.0")
    .usage("sc [command] [options]");

commander
    .command("cp-status <address>")
    .description("Returns the current status of the Chargingpole with given address")
    .action(function (address) {
        console.log("Getting status for Chargingpoint with address:", address);

        wrapContractCall("isAvailable", address)
            .then(result => {
                console.log("Is Available:", result);
                process.exit(0);
            })
    });

commander
    .command("cp-enable <address>")
    .description("Enables the Chargingpole with given address")
    .action(function (address) {
        console.log("Enabling CP at address:", address);

        wrapContractCall("setAvailability", ID, address, true)
            .then(result => {
                console.log("Is Available:", result);
                process.exit(0);
            });
    });

commander
    .command("cp-disable <address>")
    .description("Disables the Chargingpole with given address")
    .action(function (address) {
        console.log("Disabling CP at address:", address);

        wrapContractCall("setAvailability", ID, address, false)
            .then(result => {
                console.log("Is Available:", result);
                process.exit(0);
            });
    });

function wrapContractCall(...args) {

    return new Promise((resolve, reject) => {

        const contract = config.test ? new TestContract() : new Contract(PASS);

        contract.queryState(...args)
            .then((result) => resolve(result))
            .catch(e => {
                console.error(e.message);
                process.exit(1);
            })
    });
}

commander.parse(process.argv);

if (process.argv.length < 3) {
    commander.outputHelp();
    process.exit(1);
}