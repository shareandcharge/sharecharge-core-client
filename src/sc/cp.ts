import * as connectors from "../../connectors.json";
import {contractSendTx, contractQueryState, initBridge, customConfig, createConfig, coinbase } from "./helper";

const configFile = './conf.yaml';
const config = createConfig(customConfig(configFile));
const bridge = initBridge(configFile);

export default (yargs) => {

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

                        result.state.ev = contractState ? "available" : "unavailable";

                        if (!argv.json) {
                            console.log("EV Network:\t", result.state.ev);
                        }

                        bridge.connectorStatus(argv.id)
                            .then(bridgeState => {

                                result.state.bridge = bridgeState;

                                if (argv.json) {
                                    console.log(JSON.stringify(result, null, 2));
                                }
                                else {
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
                    console.log(`Disabling CP with id: ${argv.id} for client: ${config.id}`);
                }

                contractSendTx("setAvailability", config.id, argv.id, false)
                    .then((contractResult: any) => {

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
                    console.log("Enabling CP with id:", argv.id, "for client:", config.id);
                }

                contractSendTx("setAvailability", config.id, argv.id, true)
                    .then((contractResult: any) => {

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

        .command("register [id]",
            "Registers a Charge Point with given id in the EV Network",
            (yargs) => {
                yargs
                    .positional("id", {
                        describe: "a unique identifier for the Charge Point",
                        type: "string"
                    })
                    .string("_")
                    .demand("id");
            }, (argv) => {

                // load connector
                const cp = connectors[argv.id];

                let result: any = {
                    id: null,
                    register: {
                        txHash: null,
                        block: null,
                        success: false
                    }
                };

                if (!cp) {
                    if (argv.json) {
                        console.log(JSON.stringify(result, null, 2));
                    } else {
                        console.error(`No CP found with id ${argv.id} in configuration.`);
                    }
                    process.exit(1);
                }

                result.id = cp.id;

                const clientId = config.id || cp.client;

                if (!argv.json) {
                    console.log("Registering CP with id:", cp.id, "for client:", clientId);
                }

                contractSendTx("registerConnector",
                    cp.id, clientId, cp.owner, cp.lat, cp.lng, cp.price, cp.model, cp.plugType,
                    cp.openingHours, cp.isAvailable)
                    .then((contractResult: any) => {

                        result.register.success = contractResult.status === "mined";
                        result.register.txHash = contractResult.txHash;
                        result.register.block = contractResult.blockNumber;

                        if (argv.json) {
                            console.log(JSON.stringify(result, null, 2));
                        } else {
                            console.log("Success:", result.register.success);
                            console.log("Tx:", result.register.txHash);
                            console.log("Block:", result.register.block);
                        }

                        process.exit(0);
                    });
            })

        .command("start [id] [seconds]",
            "Start a charging session at a given Charge Point",
            (yargs) => {
                yargs
                    .positional("id", {
                        describe: "a unique identifier for the Charge Point",
                        type: "string",
                    })
                    .positional("seconds", {
                        describe: "time to rent in seconds",
                        type: "number",
                        default: 10
                    })
                    .string('_')
                    .demand('id')

            }, (argv) => {
                console.log(argv)
                contractSendTx('requestStart', argv.id, argv.seconds)
                    .then(res => {

                        console.log('requestStart res:', res);
                        if (res.blockNumber) {
                            
                            coinbase()
                                .then(address => {
                                    console.log('coinbase:', res);

                                    contractSendTx('confirmStart', argv.id, address)
                                        .then(res => {
                                            console.log('confirmStart res:', res);
                                        })


                            })
                            

                        }
                    })
            }
        
        );
}
