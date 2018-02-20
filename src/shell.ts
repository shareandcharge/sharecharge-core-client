//import {Contract} from "./lib/src/services/contract";
//import {TestContract} from "./lib/test/test-contract";
import {Contract} from "../../core-client-lib/src/services/contract";
import {TestContract} from "../../core-client-lib/test/test-contract";
import * as yargs from "yargs";

import {config} from "../config";

const ID = process.env.ID || "";
const PASS = process.env.PASS || "";
const bridge = config.bridge;

const contractQueryState = (method, ...args) => {

    return new Promise((resolve, reject) => {

        const contract = config.test ? new TestContract() : new Contract(PASS);

        contract.queryState(method, ...args)
            .then((result) => resolve(result))
            .catch(e => {
                console.error(e);
                process.exit(1);
            })
    });
};

const contractSendTx = (method, ...args) => {

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

const argv = yargs
    .usage("Usage: sc <command> [options]")
    .version("0.0.1")
    .alias("v", "version")
    .alias("h", "help")
    .option("json", {
        describe: "generate json output"
    })
    .command("cp", "Charge Point commands", (yargs) => {

        yargs
            .usage("Usage: sc cp <command> [options]")
            .demandCommand(1);

        yargs
            .command("status [id]",
                "Returns the current status of the Charge Point with given id",
                (yargs) => {
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

                    contractQueryState("isAvailable", argv.id)
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
                "Disables the Charge Point with given id",
                (yargs) => {
                    yargs
                        .positional("id", {
                            describe: "a unique identifier for the Charge Point",
                            type: "string"
                        })
                        .string("_")
                        .demand("id");
                }, (argv) => {

                    let result: any = {
                        id: argv.id,
                        disabled: {
                            txHash: null,
                            block: null,
                            success: null
                        }
                    };

                    if (!argv.json) {
                        console.log("Disabling CP with id:", argv.id);
                    }

                    contractSendTx("setAvailability", ID, argv.id, false)
                        .then(contractResult => {

                            result.disabled.success = contractResult.status === "mined";
                            result.disabled.txHash = contractResult.txHash;
                            result.disabled.block = contractResult.blockNumber;

                            if (argv.json) {
                                console.log(JSON.stringify(result, null, 2));
                            } else {
                                console.log("Success:", result.disabled.success);
                                console.log("Tx:", result.disabled.txHash);
                                console.log("Block:", result.disabled.success);
                            }

                            process.exit(0);
                        });
                });

        yargs
            .command("enable [id]",
                "Enables the Charge Point with given id",
                (yargs) => {
                    yargs
                        .positional("id", {
                            describe: "a unique identifier for the Charge Point",
                            type: "string"
                        })
                        .string("_")
                        .demand("id");
                }, (argv) => {

                    let result: any = {
                        id: argv.id,
                        enabled: {
                            txHash: null,
                            block: null,
                            success: null
                        }
                    };

                    if (!argv.json) {
                        console.log("Enabling CP with id:", argv.id);
                    }

                    contractSendTx("setAvailability", ID, argv.id, true)
                        .then(contractResult => {

                            result.enabled.success = contractResult.status === "mined";
                            result.enabled.txHash = contractResult.txHash;
                            result.enabled.block = contractResult.blockNumber;

                            if (argv.json) {
                                console.log(JSON.stringify(result, null, 2));

                            } else {
                                console.log("Success:", result.enabled.success);
                                console.log("Tx:", result.enabled.txHash);
                                console.log("Block:", result.enabled.block);
                            }

                            process.exit(0);
                        });
                })

    }, (argv) => {
        // this command has sub commands, exit
        yargs.showHelp();
    })
    .command("bridge", "Bridge commands", (yargs) => {

        yargs
            .usage("Usage: sc bridge <command> [options]")
            .demandCommand(1);

        yargs
            .command("status",
                "Returns the current status of the configured Bridge", {},
                (argv) => {

                    let result: any = {
                        name: null,
                        bridge: {
                            isAvailable: null
                        }
                    };

                    if (!argv.json) {
                        console.log("Getting status of bridge.");
                    }

                    result.name = bridge.name;

                    bridge.health()
                        .then(isAvailable => {

                            result.bridge.isAvailable = isAvailable;

                            if (argv.json) {
                                console.log(JSON.stringify(result, null, 2));
                            } else {
                                console.log("Bridge Available:", result.bridge.isAvailable);
                                console.log("Bridge name:", result.name)
                            }
                        });
                });

    }, (argv) => {
        // this command has sub commands, exit
        yargs.showHelp();
    })
    .demandCommand(1)
    .argv;
