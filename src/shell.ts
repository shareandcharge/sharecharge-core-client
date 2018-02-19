import {Contract} from "./lib/src/services/contract";
import {TestContract} from "./lib/test/test-contract";
import * as yargs from "yargs";

import {config} from "../config";

const ID = process.env.ID || "";
const PASS = process.env.PASS || "";
const bridge = config.bridge;

const wrapContractCall = (method, ...args) => {

    return new Promise((resolve, reject) => {

        const contract = config.test ? new TestContract() : new Contract(PASS);

        contract.queryState(method, ...args)
            .then((result) => resolve(result))
            .catch(e => {
                console.error(e.message);
                process.exit(1);
            })
    });
};

const checkCommands = (yargs, argv, numRequired) => {

    if (argv._.length < numRequired) {
        yargs.showHelp();
    } else {
        // check for unknown command
    }
};

const argv = yargs
    .usage("Usage: sc <command> [options]")
    .version("0.0.1")
    .alias("v", "version")
    .alias("h", "help")
    .command("cp", "Charge Point commands", (yargs) => {

        yargs
            .command("status [id]",
                "Returns the current status of the Charge Point with given id", (yargs) => {
                    yargs
                        .positional("id", {
                            describe: "a unique identifier for the Charge Point",
                            type: "string"
                        })
                        .string("_")
                        .demand("id")
                }, (argv) => {

                    let result: any = {
                        id: argv.id,
                        state: {
                            bridge: null,
                            ev: null
                        }
                    };

                    if (!argv.json) {
                        console.log("Getting status for Charge Point with id:", argv.id);
                    }

                    wrapContractCall("isAvailable", argv.id)
                        .then(contractState => {

                            bridge.connectorStatus(argv.id)
                                .then(bridgeState => {

                                    result.state.bridge = bridgeState;
                                    result.state.ev = contractState ? "available" : "unavailable";

                                    if (argv.json) {
                                        console.log(JSON.stringify(result, null, 2));
                                    }
                                    else {
                                        console.log("EV Network:\t", result.state.ev);
                                        console.log("CPO Backend:\t", result.state.bridge);
                                    }

                                    process.exit(0);
                                });
                        });
                });

        yargs
            .command("disable [id]",
                "Disables the Charge Point with given id", (yargs) => {
                    yargs
                        .positional("id", {
                            describe: "a unique identifier for the Charge Point",
                            type: "string"
                        })
                        .string("_")
                        .demand("id");
                }, (argv) => {

                    console.log("Disabling CP with id:", argv.id);

                    wrapContractCall("setAvailability", ID, argv.id, false)
                        .then(result => {
                            console.log("Is Available:", result);
                            process.exit(0);
                        });
                });

        yargs
            .command("enable [id]",
                "Enables the Charge Point with given id", (yargs) => {
                    yargs
                        .positional("id", {
                            describe: "a unique identifier for the Charge Point",
                            type: "string"
                        })
                        .string("_")
                        .demand("id");
                }, (argv) => {

                    console.log("Enabling CP with id:", argv.id);

                    wrapContractCall("setAvailability", ID, argv.id, true)
                        .then(result => {

                            console.log("Is Available:", result);
                            process.exit(0);
                        });
                })

    }, (argv) => {
        // this command has sub commands, exit
        yargs.showHelp();
    })
    .demandCommand(1)
    .option("json", {
        describe: "generate json output"
    })
    .argv;

checkCommands(yargs, argv, 1);
