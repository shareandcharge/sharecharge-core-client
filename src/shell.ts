import {Contract} from "./lib/src/services/contract";
import {TestContract} from "./lib/test/test-contract";
import * as commander from "commander";

import {config} from "../config";

const contract = config.test ? new TestContract() : new Contract(config.pass);

commander
    .version("0.1.0")
    .usage("sc [command] [options]");

commander
    .command("cp-status <address>")
    .description("Returns the current status of the Chargingpole with given address")
    .action(function (address) {
        console.log("Getting status for Chargingpoint with address:", address);

        contract.queryState("isAvailable", address)
            .then(result => {
                console.log("Is Available:", result);
                process.exit(0);
            })
    });

commander
    .command("cp-enable <address>")
    .description("Enables the Chargingpole with given address")
    .action(function (address) {
        console.log("cp-enable", address);
        process.exit(0);
    });

commander
    .command("cp-disable <address>")
    .description("Disables the Chargingpole with given address")
    .action(function (address) {
        console.log("cp-disable", address);
        process.exit(0);
    });

commander.parse(process.argv);

if (process.argv.length < 3) {
    commander.outputHelp();
    process.exit(1);
}