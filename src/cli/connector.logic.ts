import { Connector, ShareCharge, Wallet } from "../../../sharecharge-lib/dist/src";
import { loadConfigFromFile } from "../utils/config";
import IClientConfig from "../models/iClientConfig";

const config: IClientConfig = loadConfigFromFile("./config/config.yaml");
const wallet: Wallet = new Wallet(config.seed);

const sc = new ShareCharge(config);

const doRegister = async (cp, id) => {

    let connector: Connector = await sc.connectors.getById(id);

    connector.owner = config.id;
    connector.stationId = "0x12";
    connector.available = cp.available;
    connector.plugTypes = cp.plugTypes;

    await sc.connectors.useWallet(wallet).create(connector);

    return {
        Id: connector.id,
        Owner: connector.owner,
        StationId: connector.stationId,
        Available: connector.available,
        PlugTypes: connector.plugTypes
    }
};

export const register = async (argv) => {

    if (!argv.json) {
        console.log(`Registering Connector with id: ${argv.id}`);
    }

    const cp = config.connectors[argv.id];

    if (!cp) {

        if (argv.json) {
            console.log(JSON.stringify({}, null, 2));
        } else {
            console.error(`No CP found with id ${argv.id} in configuration.`);
        }
    }

    const result = doRegister(cp, argv.id);

    if (argv.json) {
        console.log(JSON.stringify(result, null, 2));
    }

};

export const registerAll = async (argv) => {

    if (!argv.json) {
        console.log("Registering all Charge points from the configuration");
    }

    const ids = Object.keys(config.connectors);

    const results: any[] = [];

    for (let id of ids) {

        const cp = config.connectors[id];
        const result = doRegister(cp, argv.id);
        results.push(result);
    }

    if (argv.json) {
        console.log(JSON.stringify(results, null, 2))
    }
};

export const status = (argv) => {

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

    /*
    contractQueryState("getAvailability", argv.id)
        .then(contractState => {

            result.state.ev = contractState ? "available" : "unavailable";

            if (!argv.json) {
                console.log("EV Network:\t", result.state.ev);
            }

            config.bridge.connectorStatus(argv.id)
                .then(bridgeState => {

                    result.state.bridge = bridgeState;

                    if (argv.json) {
                        console.log(JSON.stringify(result, null, 2));
                    }
                    else {
                        console.log("CPO Backend:\t", result.state.bridge);
                    }


                });

        });*/
};

export const info = async (argv) => {

    const connector: Connector = await sc.connectors.getById(argv.id);

    if (argv.json) {
        console.log(JSON.stringify({
            Id: connector.id,
            Owner: connector.owner,
            StationId: connector.stationId,
            Available: connector.available,
            PlugTypes: connector.plugTypes
        }, null, 2));
    } else {
        console.log("ID:", connector.id);
        console.log("Owner:", connector.owner);
        console.log("StationId:", connector.stationId);
        console.log("Available:", connector.available);
        console.log("PlugTypes:", connector.plugTypes);
    }
};

export const infoAll = async (argv) => {

    if (!argv.json) {
        console.log("Getting all Charge points infos from EV Network");
    }

    /*
    const numberOfConnectors = await contractQueryState("getNumberOfConnectors");

    if (!argv.json) {
        console.log("Number of connectors all over", numberOfConnectors);
    }

    const ids: any[] = [];

    for (let index = 0; index < numberOfConnectors; index++) {
        const id = await contractQueryState("getIdByIndex", index);
        ids.push(id);
    }

    const results: any = {};

    const coinbase = await getCoinbase();

    for (let id of ids) {

        const result = await getConnectorInfo(id, argv.json);

        if (result[id].owner.toLowerCase() === coinbase) {

            results[id] = result[id];
        }
    }

    if (!argv.json) {
        console.log("Number of your connectors", Object.keys(results).length);
    }

    if (argv.json) {
        console.log(JSON.stringify(results, null, 2))
    }*/


};

export const disable = (argv) => {

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

    /*
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


        });*/
};

export const enable = (argv) => {

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

    /*
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


        });*/
};

export const start = (argv) => {
    console.log(`Starting charge on ${argv.id} for ${argv.seconds} seconds...`);

    /*
    contractSendTx("requestStart", argv.id, argv.seconds)
        .then((res: any) => {

            getCoinbase()
                .then(address => {
                    console.log(`Start request by ${address} included in block ${res.blockNumber}`);

                    contractSendTx("confirmStart", argv.id, address)
                        .then((res: any) => {
                            console.log(`Start confirmation included in block ${res.blockNumber}`);

                            const bar = new ProgressBar(":msg [:bar] :currents", {
                                total: argv.seconds,
                                incomplete: " ",
                                width: 80
                            });

                            const timer = setInterval(() => {
                                bar.tick({msg: "Charging"});

                                if (bar.complete) {
                                    clearInterval(timer);

                                    contractSendTx("confirmStop", argv.id, address)
                                        .then((res: any) => {
                                            console.log(`Stop confirmation included in block ${res.blockNumber}`);

                                        });
                                }

                            }, 1000);
                        });
                });

        });*/
};

export const stop = (argv) => {

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

    /*
    getCoinbase()
        .then((address) => {
            contractSendTx("requestStop", argv.id)
                .then((res: any) => {

                    console.log(`Stop request included in block ${res.blockNumber}`);

                    contractSendTx("confirmStop", argv.id, address)
                        .then((res: any) => {

                            console.log(`Stop confirmation included in block ${res.blockNumber}`);

                        });
                });
        }); */
};