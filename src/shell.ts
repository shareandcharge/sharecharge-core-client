import {Contract} from "./lib/src/services/contract";
import {TestContract} from "./lib/test/test-contract";
import * as yargs from "yargs";

import {config} from "../config";

const ID = process.env.ID || "";
const PASS = process.env.PASS || "";
const bridge = config.bridge;

const parseByte = (optString) => {
    const k = parseInt(optString, 10).toString(16);
    return "0x" + k;
};

const argv = yargs
    .usage("Usage: sc <command> [options]")
    .command("cp", "Charge Point commands", (yargs) => {

        yargs
            .command("status [id]",
                "Returns the current status of the Chargingpole with given id", (yargs) => {
                    yargs
                        .positional('id', {
                            describe: 'a unique identifier for the Charge Point',
                            type: 'string'
                        })
                        .coerce('id', parseByte);

                }, (argv) => {

                    console.log("Getting status for Chargingpoint with id:", argv.id);

                    wrapContractCall("isAvailable", argv.id)
                        .then(contractState => {
                            bridge.connectorStatus(argv.id)
                                .then(bridgeState => {
                                    console.log("EV Network:\t", contractState ? 'available' : 'unavailable');
                                    console.log("CPO Backend:\t", bridgeState);
                                    process.exit(0);
                                });

                        });

                })
            .demand("id");

        yargs
            .command("disable [id]",
                "Disables the Charge Point with given id", (yargs) => {
                    yargs
                        .positional('id', {
                            describe: 'a unique identifier for the charge pole',
                            type: 'string'
                        })
                        .coerce('id', parseByte);

                }, (argv) => {

                    console.log("Disabling CP with id:", argv.id);

                    wrapContractCall("setAvailability", ID, argv.id, false)
                        .then(result => {
                            console.log("Is Available:", result);
                            process.exit(0);
                        });
                })
            .demand("id");

        yargs
            .command("enable [id]",
                "Enables the Charge Point with given id", (yargs) => {
                    yargs
                        .positional('id', {
                            describe: 'a unique identifier for the Charge Point',
                            type: 'string'
                        })
                        .coerce('id', parseByte);

                }, (argv) => {

                    console.log("Enabling CP with id:", argv.id);

                    wrapContractCall("setAvailability", ID, argv.id, true)
                        .then(result => {

                            console.log("Is Available:", result);
                            process.exit(0);
                        });
                })
            .demand("id");

    }, (argv) => {
        yargs.showHelp();
        checkCommands(yargs, argv, 2);
    })
    .demandCommand(1)
    .argv;


function wrapContractCall(method, ...args) {

    return new Promise((resolve, reject) => {

        const contract = config.test ? new TestContract() : new Contract(PASS);

        contract.queryState(method, ...args)
            .then((result) => resolve(result))
            .catch(e => {
                console.error(e.message);
                process.exit(1);
            })
    });
}

checkCommands(yargs, argv, 1);

function checkCommands(yargs, argv, numRequired) {

    if (argv._.length < numRequired) {
        yargs.showHelp()
    } else {
        // check for unknown command
    }
}