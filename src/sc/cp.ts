import * as connectors from "../../connectors.json";
import {contractSendTx, contractQueryState} from "./helper";
import {config} from "../../config";

const ID = process.env.ID || "";
const bridge = config.bridge;

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
                    console.log("Disabling CP with id:", argv.id, "for client:", ID);
                }

                contractSendTx("setAvailability", ID, argv.id, false)
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
                    console.log("Enabling CP with id:", argv.id, "for client:", ID);
                }

                contractSendTx("setAvailability", ID, argv.id, true)
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
            "Registers a Charge Point with given id in the EV Nwtwork",
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
                    id: cp.id,
                    register: {
                        txHash: null,
                        block: null,
                        success: null
                    }
                };

                const clientId = ID || cp.client;

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
}
