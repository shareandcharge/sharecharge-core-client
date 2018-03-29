import { Evse } from "sharecharge-lib";
import LogicBase from "./logicBase"

export default class EvseLogic extends LogicBase {

    private async doRegister(evseToRegister, id, stfu) {

        // let evse: Evse = await this.client.sc.evses.getById(id);
        let evse = new Evse();
        evse.stationId = evseToRegister.stationId;
        evse.currency = evseToRegister.currency;
        evse.basePrice = evseToRegister.basePrice;
        evse.tariffId = evseToRegister.tariffId;
        evse.available = evseToRegister.available;

        await this.client.sc.evses.useWallet(this.client.wallet).create(evse);
        // this.client.logger.info(`evse with id ${id} created`);
        
        return {
            id: evse.id,
            owner: evse.owner,
            stationId: evse.stationId,
            available: evse.available,
            
        }
    }

    private async getInformation(id) {

        let result: any = null;

        const evse: Evse = await this.client.sc.evses.getById(id);

        if (!evse.owner.startsWith("0x00")) {
            result = {
                id: evse.id,
                owner: evse.owner,
                stationId: evse.stationId,
                available: evse.available,
            }
        }

        return result;
    }

    public register = async (argv) => {

        if (!argv.json) {
            this.client.logger.info(`Registering evse with id: ${argv.id}`);
        }

        let result: any = {
            id: argv.id,
            success: false
        };

        const evse = this.client.evses[argv.id];

        if (!evse) {

            if (argv.json) {
                this.client.logger.info(JSON.stringify({}, null, 2));
            } else {
                console.error(`No evse found with id ${argv.id} in configuration.`);
            }
        }

        result = await this.doRegister(evse, argv.id, argv.json);

        if (argv.json) {
            this.client.logger.info(JSON.stringify(result, null, 2));
        } else {
            this.client.logger.info("All done");
        }

        return result;
    };

    public registerAll = async (argv) => {

        if (!argv.json) {
            this.client.logger.info("Registering all evses from the configuration");
        }

        const ids = Object.keys(this.client.evses);

        const results: any[] = [];

        for (let id of ids) {

            const cp = this.client.evses[id];
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
            this.client.logger.info(`Getting Info for evse ${argv.id}`);
        }

        const result: any = await this.getInformation(argv.id);

        if (result) {
            if (!argv.json) {
                this.client.logger.info("ID:", result.id);
                this.client.logger.info("Owner:", result.owner);
                this.client.logger.info("StationId:", result.stationId);
                this.client.logger.info("Available:", result.available);
            } else {
                console.log(JSON.stringify(result, null, 2));
            }
        } else {
            if (!argv.json) {
                this.client.logger.warn("evse not registered");
            } else {
                console.log(JSON.stringify({}, null, 2));
            }
        }

        return result;
    };

    public infoAll = async (argv) => {

        if (!argv.json) {
            this.client.logger.info("Getting all evse infos from EV Network");
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
            this.client.logger.info("Getting status for evse with id:", argv.id);
        }

        const evse = await this.client.sc.evses.getById(argv.id);

        if (!evse.owner.startsWith("0x00")) {

            result.state.ev = evse.available;
            result.state.bridge = await this.client.bridge.evseStatus(argv.id);
        }

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
            this.client.logger.info(`Disabling evse with id: ${argv.id}`);
        }

        const evse = await this.client.sc.evses.getById(argv.id);

        if (!evse.owner.startsWith("0x00")) {

            // only disable if available
            if (evse.available) {
                evse.available = false;
                await this.client.sc.evses.useWallet(this.client.wallet).update(evse);
                result.success = true;
            } else if (!argv.json) {
                this.client.logger.info("evse already disabled");
            }
        } else if (!argv.json) {
            this.client.logger.info("evse not registered");
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

        const evse = await this.client.sc.evses.getById(argv.id);

        // only enable if persisted
        if (!evse.owner.startsWith("0x00")) {

            if (!argv.json) {
                this.client.logger.info(`Enabling evse with id: ${evse.id}`);
            }

            // only enable if disabled
            if (!evse.available) {
                evse.available = true;
                await this.client.sc.evses.useWallet(this.client.wallet).update(evse);
                result.success = true;
            } else if (!argv.json) {
                this.client.logger.info("evse already enabled");
            }

        } else if (!argv.json) {
            this.client.logger.info("evse not registered");
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

        const evse = await this.client.sc.evses.getById(argv.id);

        if (!argv.json) {
            this.client.logger.info(`Starting charge on ${evse.id} for ${argv.seconds} seconds...`);
        }

        if (!evse.owner.startsWith("0x00")) {

            // only charge if available
            if (evse.available) {

                await this.client.sc.charging.useWallet(this.client.wallet).requestStart(evse, argv.seconds, argv.energy);
                result.success = true;

                if (!argv.json) {
                    this.client.logger.info("Charge started");
                }

            } else if (!argv.json) {
                this.client.logger.warn("evse not available");
            }

        } else if (!argv.json) {
            this.client.logger.warn("evse not registered");
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

        const evse = await this.client.sc.evses.getById(argv.id);

        if (!argv.json) {
            this.client.logger.info("Stopping charge on evse with ID:", evse.id);
        }

        if (!evse.owner.startsWith("0x00")) {

            // only stop if not available
            if (!evse.available) {

                await this.client.sc.charging.useWallet(this.client.wallet).requestStop(evse);
                result.success = true;

                if (!argv.json) {
                    this.client.logger.info("Charge stopped");
                }

            } else if (!argv.json) {
                this.client.logger.warn("No charge running, nothing to stop");
            }

        } else if (!argv.json) {
            this.client.logger.warn("evse not registered");
        }

        if (argv.json) {
            console.log(JSON.stringify(result, null, 2));
        } else {
            this.client.logger[result.success ? "info" : "warn"]("Success:", result.success);
        }

        return result;
    };
}
