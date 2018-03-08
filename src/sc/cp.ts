import * as ProgressBar from 'progress';
import { contractSendTx, contractQueryState, getCoinbase, parseConfigFile } from "./helper";
import { initBridge, customConfig, createConfig } from "./helper";

const configFile = './conf.yaml';
const config = createConfig(customConfig(configFile));
const bridge = initBridge(configFile);

const registerConnector = (id, json) => {

    return new Promise((resolve, reject) => {

        const cp = config.connectors[id];

        let result: any = {
            id: id,
            register: {
                txHash: null,
                block: null,
                success: false
            }
        };

        if (!cp) {

            if (json) {
                console.log(JSON.stringify(result, null, 2));
            } else {
                console.error(`No CP found with id ${id} in configuration.`);
            }

            return reject(result);
        }

        const args = [
            config.id, cp.ownerName, cp.lat,
            cp.lng, cp.price, cp.priceModel, cp.plugType,
            cp.openingHours, cp.isAvailable,
        ];

        contractQueryState("updateRequired", id, ...args)
            .then(needsUpdate => {

                if (needsUpdate) {

                    if (!json) {
                        console.log("Registering CP with id:", id, "for client:", config.id);
                    }

                    contractSendTx("registerConnector", id, ...args)
                        .then((contractResult: any) => {

                            result.register.success = contractResult.status === "mined";
                            result.register.txHash = contractResult.txHash;
                            result.register.block = contractResult.blockNumber;

                            if (json) {
                                console.log(JSON.stringify(result, null, 2));
                            } else {
                                console.log("Success:", result.register.success);
                                console.log("Tx:", result.register.txHash);
                                console.log("Block:", result.register.block);
                            }

                            return resolve(result);
                        });
                } else {

                    if (json) {
                        console.log(JSON.stringify(result, null, 2));
                    } else {
                        console.log("Registering/Updating CP with id:", id, "for client:", config.id, "not needed.");
                    }

                    return resolve(result);
                }
            });

    });

};

export default (yargs) => {

    yargs
        .usage("Usage: sc cp <command> [options]")
        .config('config', 'Path to plaintext config file', (parseConfigFile))
        .demandCommand(1)

        .command("register [id]",
            "Registers a Charge Point with given id in the EV Network",
            (yargs) => {

                yargs
                    .command("all",
                        "Registers all Charge Points in the EV Network",
                        (yargs) => {
                            // no id in this case, srly
                            yargs.default("id", "");
                        }, async (argv) => {

                            console.log("Registering all Charge points from the configuration");

                            const ids = Object.keys(config.connectors);

                            for (let id of ids) {
                                const result = await registerConnector(id, argv.json);
                            }

                            process.exit(0);
                        });

                yargs
                    .positional("id", {
                        describe: "a unique identifier for the Charge Point",
                        type: "string"
                    })
                    .string("_")
                    .demand("id");

            }, async (argv) => {

                const result = await registerConnector(argv.id, argv.json);

                process.exit(0);
            })

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

                contractQueryState("getAvailability", argv.id)
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
            })

        .command("info [id]",
            "Returns the current info of the Charge Point with given id",
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
                    [argv.id]: {
                        ownerName: null,
                        lat: null,
                        lng: null,
                        price: null,
                        priceModel: null,
                        plugType: null,
                        openingHours: null,
                        isAvailable: null,
                        session: null
                    }
                };

                if (!argv.json) {
                    console.log("Getting info for Charge Point with ID:", argv.id);
                }

                const location = contractQueryState("getLocationInformation", argv.id)
                    .then((location: any) => {

                        result[argv.id].lat = location.lat;
                        result[argv.id].lng = location.lng;
                    });

                const owner = contractQueryState("getOwnerInformation", argv.id)
                    .then((owner: any) => {

                        result[argv.id].ownerName = owner.ownerName;
                    });

                const general = contractQueryState("getGeneralInformation", argv.id)
                    .then((general: any) => {

                        result[argv.id].price = general.price;
                        result[argv.id].priceModel = general.priceModel;
                        result[argv.id].plugType = general.plugType;
                        result[argv.id].openingHours = general.openingHours;
                        result[argv.id].isAvailable = general.isAvailable;
                        result[argv.id].session = general.session;
                    });

                Promise.all([location, owner, general])
                    .then(results => {

                        if (argv.json) {
                            console.log(JSON.stringify(result, null, 2));
                        } else {
                            console.log("lat:", result[argv.id].lat);
                            console.log("lng:", result[argv.id].lng);
                            console.log("OwnerName:", result[argv.id].ownerName);
                            console.log("Price:", result[argv.id].price);
                            console.log("PriceModel:", result[argv.id].priceModel);
                            console.log("PlugType:", result[argv.id].plugType);
                            console.log("OpeningHouts:", result[argv.id].openingHours);
                            console.log("IsAvailable:", result[argv.id].isAvailable);
                            console.log("Session:", result[argv.id].session);
                        }

                        process.exit(0);
                    })
            })

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
            })

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
                console.log(`Starting charge on ${argv.id} for ${argv.seconds} seconds...`);

                contractSendTx('requestStart', argv.id, argv.seconds)
                    .then((res: any) => {

                        getCoinbase()
                            .then(address => {
                                console.log(`Start request by ${address} included in block ${res.blockNumber}`);

                                contractSendTx('confirmStart', argv.id, address)
                                    .then((res: any) => {
                                        console.log(`Start confirmation included in block ${res.blockNumber}`);

                                        const bar = new ProgressBar(':msg [:bar] :currents', {
                                            total: argv.seconds,
                                            incomplete: ' ',
                                            width: 80
                                        });

                                        const timer = setInterval(() => {
                                            bar.tick({msg: 'Charging'});

                                            if (bar.complete) {
                                                clearInterval(timer);

                                                contractSendTx('confirmStop', argv.id)
                                                    .then((res: any) => {
                                                        console.log(`Stop confirmation included in block ${res.blockNumber}`);
                                                        process.exit(1);
                                                    });
                                            }

                                        }, 1000);
                                    });
                            });

                    });
            }
        )

        .command("stop [id]",
            "Stops a charging session at a given Charge Point",
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
                    stop: {
                        bridge: null,
                        ev: null
                    }
                };

                if (!argv.json) {
                    console.log("Stopping charge on Charge Point with ID:", argv.id);
                }

                contractSendTx('requestStop', argv.id)
                    .then((res: any) => {

                        console.log(`Stop request included in block ${res.blockNumber}`);

                        contractSendTx('confirmStop', argv.id)
                            .then((res: any) => {

                                console.log(`Stop confirmation included in block ${res.blockNumber}`);
                                process.exit(1);
                            });
                    });
            });
}
