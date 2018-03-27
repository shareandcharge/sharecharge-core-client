import { Evse, PlugType } from "sharecharge-lib";
import LogicBase from "./LogicBase"

export default class ConnectorLogic extends LogicBase {

    private async doRegister(connectorToRegister, id, stfu) {

        let connector: Evse = await this.client.sc.evses.getById(id);

        connector.stationId = "0x00";
        connector.available = connectorToRegister.available;
        connector.plugTypes = connectorToRegister.plugTypes.map(type => {
            return PlugType[type];
        });

        if (!await this.client.sc.evses.isPersisted(connector)) {
            await this.client.sc.evses.useWallet(this.client.wallet).create(connector);
            if (!stfu) {
                this.client.logger.info(`Connector with id ${id} created`);
            }
        } else if (!stfu) {
            this.client.logger.warn(`Connector with id ${id} already created`);
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

        if (await this.client.sc.evses.isPersisted(Evse.deserialize({id}))) {

            const connector: Evse = await this.client.sc.evses.getById(id);

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
            this.client.logger.info(`Registering Connector with id: ${argv.id}`);
        }

        let result: any = {
            id: argv.id,
            success: false
        };

        const connector = this.client.connectors[argv.id];

        if (!connector) {

            if (argv.json) {
                this.client.logger.info(JSON.stringify({}, null, 2));
            } else {
                console.error(`No Connector found with id ${argv.id} in configuration.`);
            }
        }

        result = await this.doRegister(connector, argv.id, argv.json);

        if (argv.json) {
            this.client.logger.info(JSON.stringify(result, null, 2));
        } else {
            this.client.logger.info("All done");
        }

        return result;
    };

    public registerAll = async (argv) => {

        if (!argv.json) {
            this.client.logger.info("Registering all Connectors from the configuration");
        }

        const ids = Object.keys(this.client.connectors);

        const results: any[] = [];

        for (let id of ids) {

            const cp = this.client.connectors[id];
            const result = await this.doRegister(cp, id, argv.json);
            results.push(result);
        }

        if (argv.json) {
            this.client.logger.info(JSON.stringify(results, null, 2))
        } else {
            this.client.logger.info("All done");
        }

        return results;
    };

    public info = async (argv) => {

        if (!argv.json) {
            this.client.logger.info(`Getting Info for Connector ${argv.id}`);
        }

        const result: any = await this.getInformation(argv.id);

        if (result) {
            if (!argv.json) {
                this.client.logger.info("ID:", result.id);
                this.client.logger.info("Owner:", result.owner);
                this.client.logger.info("StationId:", result.stationId);
                this.client.logger.info("Available:", result.available);
                this.client.logger.info("PlugTypes:", result.plugTypes);
            } else {
                console.log(JSON.stringify(result, null, 2));
            }
        } else {
            if (!argv.json) {
                this.client.logger.warn("Connector not registered");
            } else {
                console.log(JSON.stringify({}, null, 2));
            }
        }

        return result;
    };

    public infoAll = async (argv) => {

        if (!argv.json) {
            this.client.logger.info("Getting all Connector infos from EV Network");
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
            this.client.logger.info("Getting status for Connector with id:", argv.id);
        }

        const connector = await this.client.sc.evses.getById(argv.id);

        result.state.ev = connector.available;
        result.state.bridge = await this.client.bridge.connectorStatus(argv.id);

        if (argv.json) {
            console.log(JSON.stringify(result, null, 2));
        } else {
            this.client.logger.info("EV Network:\t", result.state.ev);
            this.client.logger.info("CPO Backend:\t", result.state.bridge);
        }

        return result;
    };

    public disable = async (argv) => {

        let result: any = {
            id: argv.id,
            success: false
        };

        if (!argv.json) {
            this.client.logger.info(`Disabling Connector with id: ${argv.id}`);
        }

        const connector = await this.client.sc.evses.getById(argv.id);

        if (await this.client.sc.evses.isPersisted(connector)) {

            // only disable if available
            if (connector.available) {
                connector.available = false;
                await this.client.sc.evses.useWallet(this.client.wallet).update(connector);
                result.success = true;
            } else if (!argv.json) {
                this.client.logger.info("Connector already disabled");
            }
        } else if (!argv.json) {
            this.client.logger.info("Connector not registered");
        }

        if (argv.json) {
            console.log(JSON.stringify(result, null, 2));
        } else {
            this.client.logger[result.success ? "info" : "warn"]("Success:", result.success);
        }

        return result;
    };

    public enable = async (argv) => {

        let result: any = {
            id: argv.id,
            success: false
        };

        const connector = await this.client.sc.evses.getById(argv.id);

        // only enable if persisted
        if (await this.client.sc.evses.isPersisted(connector)) {

            if (!argv.json) {
                this.client.logger.info(`Enabling Connector with id: ${connector.id}`);
            }

            // only enable if disabled
            if (!connector.available) {
                connector.available = true;
                await this.client.sc.evses.useWallet(this.client.wallet).update(connector);
                result.success = true;
            } else if (!argv.json) {
                this.client.logger.info("Connector already enabled");
            }

        } else if (!argv.json) {
            this.client.logger.info("Connector not registered");
        }

        if (argv.json) {
            console.log(JSON.stringify(result, null, 2));
        } else {
            this.client.logger[result.success ? "info" : "warn"]("Success:", result.success);
        }

        return result;
    };

    public start = async (argv) => {

        let result: any = {
            id: argv.id,
            success: false
        };

        const connector = await this.client.sc.evses.getById(argv.id);

        if (!argv.json) {
            this.client.logger.info(`Starting charge on ${connector.id} for ${argv.seconds} seconds...`);
        }

        if (await this.client.sc.evses.isPersisted(connector)) {

            // only charge if available
            if (connector.available) {

                await this.client.sc.charging.useWallet(this.client.wallet).requestStart(connector, argv.seconds);
                result.success = true;

                if (!argv.json) {
                    this.client.logger.info("Charge started");
                }

            } else if (!argv.json) {
                this.client.logger.warn("Connector not available");
            }

        } else if (!argv.json) {
            this.client.logger.warn("Connector not registered");
        }

        if (argv.json) {
            console.log(JSON.stringify(result, null, 2));
        } else {
            this.client.logger[result.success ? "info" : "warn"]("Success:", result.success);
        }

        return result;
    };

    public stop = async (argv) => {

        let result: any = {
            id: argv.id,
            success: false
        };

        const connector = await this.client.sc.evses.getById(argv.id);

        if (!argv.json) {
            this.client.logger.info("Stopping charge on Connector with ID:", connector.id);
        }

        if (this.client.sc.evses.isPersisted(connector)) {

            // only stop if not available
            if (!connector.available) {

                await this.client.sc.charging.useWallet(this.client.wallet).requestStop(connector);
                result.success = true;

                if (!argv.json) {
                    this.client.logger.info("Charge stopped");
                }

            } else if (!argv.json) {
                this.client.logger.warn("No charge running, nothing to stop");
            }

        } else if (!argv.json) {
            this.client.logger.warn("Connector not registered");
        }

        if (argv.json) {
            console.log(JSON.stringify(result, null, 2));
        } else {
            this.client.logger[result.success ? "info" : "warn"]("Success:", result.success);
        }

        return result;
    };
}
