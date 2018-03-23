import { Connector, ShareCharge, Wallet } from "sharecharge-lib";
import IClientConfig from "../models/iClientConfig";

export default class ConnectorLogic {

    private readonly wallet: Wallet;
    private readonly sc: ShareCharge;

    constructor(private config: IClientConfig, sc?: ShareCharge) {

        this.wallet = new Wallet(this.config.seed);
        this.sc = sc || new ShareCharge(this.config);
    }

    private async doRegister(connectorToRegister, id, stfu) {

        let connector: Connector = await this.sc.connectors.getById(id);

        connector.owner = this.config.id;
        connector.stationId = "0x12";
        connector.available = connectorToRegister.available;
        connector.plugTypes = connectorToRegister.plugTypes;

        if (!await this.sc.connectors.isPersisted(connector)) {
            await this.sc.connectors.useWallet(this.wallet).create(connector);
            if (!stfu) {
                this.config.logger.info(`Connector with id ${id} created`);
            }
        } else if (!stfu) {
            this.config.logger.warn(`Connector with id ${id} already created`);
        }

        return {
            id: connector.id,
            owner: connector.owner,
            stationId: connector.stationId,
            available: connector.available,
            plugTypes: connector.plugTypes
        }
    }

    private async getInformation(id) {

        let result: any = null;

        if (await this.sc.connectors.isPersisted(Connector.deserialize({id}))) {

            const connector: Connector = await this.sc.connectors.getById(id);

            result = {
                id: connector.id,
                owner: connector.owner,
                stationId: connector.stationId,
                available: connector.available,
                plugTypes: connector.plugTypes
            }
        }

        return result;
    }

    public register = async (argv) => {

        if (!argv.json) {
            this.config.logger.info(`Registering Connector with id: ${argv.id}`);
        }

        const connector = this.config.connectors[argv.id];

        if (!connector) {

            if (argv.json) {
                this.config.logger.info(JSON.stringify({}, null, 2));
            } else {
                console.error(`No Connector found with id ${argv.id} in configuration.`);
            }
        }

        const result = await this.doRegister(connector, argv.id, argv.json);

        if (argv.json) {
            this.config.logger.info(JSON.stringify(result, null, 2));
        } else {
            this.config.logger.info("All done");
        }

        return result;
    };

    public registerAll = async (argv) => {

        if (!argv.json) {
            this.config.logger.info("Registering all Connectors from the configuration");
        }

        const ids = Object.keys(this.config.connectors);

        const results: any[] = [];

        for (let id of ids) {

            const cp = this.config.connectors[id];
            const result = await this.doRegister(cp, id, argv.json);
            results.push(result);
        }

        if (argv.json) {
            this.config.logger.info(JSON.stringify(results, null, 2))
        } else {
            this.config.logger.info("All done");
        }

        return results;
    };

    public info = async (argv) => {

        if (!argv.json) {
            this.config.logger.info(`Getting Info for Connector ${argv.id}`);
        }

        const result: any = await this.getInformation(argv.id);

        if (result) {
            if (!argv.json) {
                this.config.logger.info("ID:", result.id);
                this.config.logger.info("Owner:", result.owner);
                this.config.logger.info("StationId:", result.stationId);
                this.config.logger.info("Available:", result.available);
                this.config.logger.info("PlugTypes:", result.plugTypes);
            } else {
                console.log(JSON.stringify(result, null, 2));
            }
        } else {
            if (!argv.json) {
                this.config.logger.warn("Connector not registered");
            } else {
                console.log(JSON.stringify({}, null, 2));
            }
        }

        return result;
    };

    public infoAll = async (argv) => {

        if (!argv.json) {
            this.config.logger.info("Getting all Connector infos from EV Network");
        }


        throw new Error("cannot get all info ");
    };

    public status = async (argv) => {

        let result: any = {
            id: argv.id,
            state: {
                bridge: false,
                ev: false
            }
        };

        if (!argv.json) {
            this.config.logger.info("Getting status for Connector with id:", argv.id);
        }

        const connector = await this.sc.connectors.getById(argv.id);

        result.state.ev = connector.available;
        result.state.bridge = await this.config.bridge.connectorStatus(argv.id);

        if (argv.json) {
            console.log(JSON.stringify(result, null, 2));
        } else {
            this.config.logger.info("EV Network:\t", result.state.ev);
            this.config.logger.info("CPO Backend:\t", result.state.bridge);
        }

        return result;
    };

    public disable = async (argv) => {

        let result: any = {
            id: argv.id,
            success: false
        };

        if (!argv.json) {
            this.config.logger.info(`Disabling Connector with id: ${argv.id} for client: ${this.config.id}`);
        }

        const connector = await this.sc.connectors.getById(argv.id);

        // only disable if available
        if (connector.available) {
            connector.available = false;
            await this.sc.connectors.useWallet(this.wallet).update(connector);
            result.success = true;
        }

        if (argv.json) {
            console.log(JSON.stringify(result, null, 2));
        } else {
            this.config.logger.info("Success:", result.success);
        }

        return result;
    };

    public enable = async (argv) => {

        let result: any = {
            id: argv.id,
            success: false
        };

        const connector = await this.sc.connectors.getById(argv.id);

        if (!argv.json) {
            this.config.logger.info("Enabling Connector with id:", connector.id, "for client:", this.config.id);
        }

        // only enable if disabled
        if (!connector.available) {
            connector.available = true;
            await this.sc.connectors.useWallet(this.wallet).update(connector);
            result.success = true;
        }

        if (argv.json) {
            console.log(JSON.stringify(result, null, 2));
        } else {
            this.config.logger.info("Success:", result.success);
        }

        return result;
    };

    public start = async (argv) => {

        let result: any = {
            id: argv.id,
            success: false
        };

        const connector = await this.sc.connectors.getById(argv.id);

        if (!argv.json) {
            this.config.logger.info(`Starting charge on ${connector.id} for ${argv.seconds} seconds...`);
        }

        if (await this.sc.connectors.isPersisted(connector)) {

            // only charge if available
            if (connector.available) {

                await this.sc.charging.useWallet(this.wallet).requestStart(connector, argv.seconds);

                await this.sc.charging.useWallet(this.wallet).confirmStart(connector, this.wallet.address);

                result.success = true;
                if (!argv.json) {
                    this.config.logger.info("Charge started");
                }

            } else if (!argv.json) {
                this.config.logger.warn("Connector not available");
            }

        } else if (!argv.json) {
            this.config.logger.warn("Connector not registered");
        }

        if (argv.json) {
            console.log(JSON.stringify(result, null, 2));
        }

        return result;
    };

    public stop = async (argv) => {

        let result: any = {
            id: argv.id,
            success: false
        };

        const connector = await this.sc.connectors.getById(argv.id);

        if (!argv.json) {
            this.config.logger.info("Stopping charge on Connector with ID:", connector.id);
        }

        if (this.sc.connectors.isPersisted(connector)) {

            // only stop if not available
            if (!connector.available) {

                await this.sc.charging.useWallet(this.wallet).confirmStop(connector, this.wallet.address);
                result.success = true;

                if (!argv.json) {
                    this.config.logger.info("Charge stopped");
                }

            } else if (!argv.json) {
                this.config.logger.warn("No charge running, nothing to stop");
            }

        } else if (!argv.json) {
            this.config.logger.warn("Connector not registered");
        }

        if (argv.json) {
            console.log(JSON.stringify(result, null, 2));
        }

        return result;
    };
}
