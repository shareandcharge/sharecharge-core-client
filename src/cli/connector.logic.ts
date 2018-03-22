import { Connector, ShareCharge, Wallet } from "sharecharge-lib";
import IClientConfig from "../models/iClientConfig";

export default class ConnectorLogic {

    private readonly wallet: Wallet;
    private readonly sc: ShareCharge;

    constructor(private config: IClientConfig, sc?: ShareCharge) {

        this.wallet = new Wallet(this.config.seed);
        this.sc = sc || new ShareCharge(this.config);
    }

    private doRegister = async (cp, id) => {

        let connector: Connector = await this.sc.connectors.getById(id);

        connector.owner = this.config.id;
        connector.stationId = "0x12";
        connector.available = cp.available;
        connector.plugTypes = cp.plugTypes;

        await this.sc.connectors.useWallet(this.wallet).create(connector);

        return {
            id: connector.id,
            owner: connector.owner,
            stationId: connector.stationId,
            available: connector.available,
            plugTypes: connector.plugTypes
        }
    };

    public register = async (argv) => {

        if (!argv.json) {
            this.config.logger.info(`Registering Connector with id: ${argv.id}`);
        }

        const cp = this.config.connectors[argv.id];

        if (!cp) {

            if (argv.json) {
                this.config.logger.info(JSON.stringify({}, null, 2));
            } else {
                console.error(`No CP found with id ${argv.id} in configuration.`);
            }
        }

        const result = await this.doRegister(cp, argv.id);

        if (argv.json) {
            this.config.logger.info(JSON.stringify(result, null, 2));
        }

        return result;
    };

    public registerAll = async (argv) => {

        if (!argv.json) {
            this.config.logger.info("Registering all Charge points from the configuration");
        }

        const ids = Object.keys(this.config.connectors);

        const results: any[] = [];

        for (let id of ids) {

            const cp = this.config.connectors[id];
            const result = await this.doRegister(cp, argv.id);
            results.push(result);
        }

        if (argv.json) {
            this.config.logger.info(JSON.stringify(results, null, 2))
        }

        return results;
    };

    public status = (argv) => {

        let result: any = {
            id: argv.id,
            state: {
                bridge: null,
                ev: null
            }
        };

        if (!argv.json) {
            this.config.logger.info("Getting status for Charge Point with id:", argv.id);
        }

        /*
        contractQueryState("getAvailability", argv.id)
            .then(contractState => {

                result.state.ev = contractState ? "available" : "unavailable";

                if (!argv.json) {
                    this.config.logger.log("EV Network:\t", result.state.ev);
                }

                config.bridge.connectorStatus(argv.id)
                    .then(bridgeState => {

                        result.state.bridge = bridgeState;

                        if (argv.json) {
                            this.config.logger.log(JSON.stringify(result, null, 2));
                        }
                        else {
                            this.config.logger.log("CPO Backend:\t", result.state.bridge);
                        }


                    });

            });*/
    };

    public info = async (argv) => {

        const connector: Connector = await this.sc.connectors.getById(argv.id);

        const result = {
            id: connector.id,
            owner: connector.owner,
            stationId: connector.stationId,
            available: connector.available,
            plugTypes: connector.plugTypes
        };

        if (argv.json) {
            this.config.logger.info(JSON.stringify(result, null, 2));
        } else {
            this.config.logger.info("ID:", result.id);
            this.config.logger.info("Owner:", result.owner);
            this.config.logger.info("StationId:", result.stationId);
            this.config.logger.info("Available:", result.available);
            this.config.logger.info("PlugTypes:", result.plugTypes);
        }

        return result;
    };

    public infoAll = async (argv) => {

        if (!argv.json) {
            this.config.logger.info("Getting all Charge points infos from EV Network");
        }

        /*
        const numberOfConnectors = await contractQueryState("getNumberOfConnectors");

        if (!argv.json) {
            this.config.logger.log("Number of connectors all over", numberOfConnectors);
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
            this.config.logger.log("Number of your connectors", Object.keys(results).length);
        }

        if (argv.json) {
            this.config.logger.log(JSON.stringify(results, null, 2))
        }*/


    };

    public disable = (argv) => {

        let result: any = {
            id: argv.id,
            disabled: {
                txHash: null,
                block: null,
                success: null
            }
        };

        if (!argv.json) {
            this.config.logger.info(`Disabling CP with id: ${argv.id} for client: ${this.config.id}`);
        }

        /*
        contractSendTx("setAvailability", config.id, argv.id, false)
            .then((contractResult: any) => {

                result.disabled.success = contractResult.status === "mined";
                result.disabled.txHash = contractResult.txHash;
                result.disabled.block = contractResult.blockNumber;

                if (argv.json) {
                    this.config.logger.log(JSON.stringify(result, null, 2));
                } else {
                    this.config.logger.log("Success:", result.disabled.success);
                    this.config.logger.log("Tx:", result.disabled.txHash);
                    this.config.logger.log("Block:", result.disabled.success);
                }


            });*/
    };

    public enable = (argv) => {

        let result: any = {
            id: argv.id,
            enabled: {
                txHash: null,
                block: null,
                success: null
            }
        };

        if (!argv.json) {
            this.config.logger.info("Enabling CP with id:", argv.id, "for client:", this.config.id);
        }

        /*
        contractSendTx("setAvailability", config.id, argv.id, true)
            .then((contractResult: any) => {

                result.enabled.success = contractResult.status === "mined";
                result.enabled.txHash = contractResult.txHash;
                result.enabled.block = contractResult.blockNumber;

                if (argv.json) {
                    this.config.logger.log(JSON.stringify(result, null, 2));

                } else {
                    this.config.logger.log("Success:", result.enabled.success);
                    this.config.logger.log("Tx:", result.enabled.txHash);
                    this.config.logger.log("Block:", result.enabled.block);
                }


            });*/
    };

    public start = (argv) => {
        this.config.logger.info(`Starting charge on ${argv.id} for ${argv.seconds} seconds...`);

        /*
        contractSendTx("requestStart", argv.id, argv.seconds)
            .then((res: any) => {

                getCoinbase()
                    .then(address => {
                        this.config.logger.log(`Start request by ${address} included in block ${res.blockNumber}`);

                        contractSendTx("confirmStart", argv.id, address)
                            .then((res: any) => {
                                this.config.logger.log(`Start confirmation included in block ${res.blockNumber}`);

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
                                                this.config.logger.log(`Stop confirmation included in block ${res.blockNumber}`);

                                            });
                                    }

                                }, 1000);
                            });
                    });

            });*/
    };

    public stop = (argv) => {

        let result: any = {
            id: argv.id,
            stop: {
                bridge: null,
                ev: null
            }
        };

        if (!argv.json) {
            this.config.logger.info("Stopping charge on Charge Point with ID:", argv.id);
        }

        /*
        getCoinbase()
            .then((address) => {
                contractSendTx("requestStop", argv.id)
                    .then((res: any) => {

                        this.config.logger.log(`Stop request included in block ${res.blockNumber}`);

                        contractSendTx("confirmStop", argv.id, address)
                            .then((res: any) => {

                                this.config.logger.log(`Stop confirmation included in block ${res.blockNumber}`);

                            });
                    });
            }); */
    };
}