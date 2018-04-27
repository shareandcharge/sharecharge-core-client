import { Evse, ToolKit } from "@motionwerk/sharecharge-lib";
import LogicBase from "../logicBase"

export default class EvseLogic extends LogicBase {

    private async getInformation(uid) {

        let result: any = null;

        const evse: Evse = await this.client.sc.evses.getByUid(uid);

        if (!evse.owner.startsWith("0x00")) {
            result = {
                id: evse.uid,
                owner: evse.owner,
                stationId: evse.stationId,
                available: evse.available,
            }
        }

        return result;
    }

    public register = async (argv) => {

        if (!argv.json) {
            this.client.logger.info(`Registering evse with uid: ${argv.id}`);
        }

        let result: any = {
            uid: argv.id,
            success: false
        };

        const evseToRegister = this.client.evses[argv.id];

        if (evseToRegister) {
            let evse: Evse = await this.client.sc.evses.getByUid(argv.id);
            let success = false;

            if (evse.owner.startsWith("0x00")) {

                evse = new Evse();
                evse.uid = argv.id;
                evse.stationId = ToolKit.asciiToHex(evseToRegister.stationId);
                evse.currency = evseToRegister.currency;
                evse.basePrice = evseToRegister.basePrice;
                evse.tariffId = evseToRegister.tariffId;
                evse.available = evseToRegister.available;

                await this.client.sc.evses.useWallet(this.client.wallet).create(evse);

                success = true;
                if (!argv.json) {
                    this.client.logger.info(`Evse with uid ${argv.id} created`);
                }
            } else if (!argv.json) {
                this.client.logger.warn(`Evse with uid ${argv.id} already registered`);
            }

            result = {
                id: evse.uid,
                owner: evse.owner,
                stationId: evse.stationId,
                available: evse.available,
                success
            };

        } else if (!argv.json) {
            this.client.logger.error(`No evse found with uid ${argv.id} in configuration.`);
        }

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

        let results: any = {};
        const evses: Evse[] = [];

        const evseUids = Object.keys(this.client.evses);

        for (let evseUid of evseUids) {

            const evseToRegister = this.client.evses[evseUid];

            let evse: Evse = await this.client.sc.evses.getByUid(evseUid);

            results[evseUid] = {
                owner: evse.owner,
                stationId: evse.stationId,
                available: evse.available,
                success: false
            };

            if (evse.owner.startsWith("0x00")) {

                evse = new Evse();
                evse.uid = evseUid;
                evse.stationId = ToolKit.asciiToHex(evseToRegister.stationId);
                evse.currency = evseToRegister.currency;
                evse.basePrice = evseToRegister.basePrice;
                evse.tariffId = evseToRegister.tariffId;
                evse.available = evseToRegister.available;

                evses.push(evse);

            } else if (!argv.json) {
                this.client.logger.warn(`Evse with uid ${evseUid} already registered!`);
            }
        }

        if (evses.length > 0) {
            await this.client.sc.evses.useWallet(this.client.wallet).batch().create(...evses);
        }

        for (let evse of evses) {
            results[evse.uid].success = true;

            if (!argv.json) {
                this.client.logger.info(`Evse with uid ${evse.uid} created`);
            }
        }

        // format back to old results
        results = Object.keys(results).map(function (resultIndex) {
            let result = results[resultIndex];
            result.id = resultIndex;
            return result;
        });

        if (argv.json) {
            console.log(JSON.stringify(results, null, 2))
        } else {
            this.client.logger.info(`All done, ${evses.length} Evses created`);
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
                this.client.logger.warn("Evse not registered");
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

        const evse = await this.client.sc.evses.getByUid(argv.id);

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

        const evse = await this.client.sc.evses.getByUid(argv.id);

        if (!evse.owner.startsWith("0x00")) {

            // only disable if available
            if (evse.available) {
                evse.available = false;
                await this.client.sc.evses.useWallet(this.client.wallet).update(evse);
                result.success = true;
            } else if (!argv.json) {
                this.client.logger.info("Evse already disabled");
            }
        } else if (!argv.json) {
            this.client.logger.info("Evse not registered");
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

        const evse = await this.client.sc.evses.getByUid(argv.id);

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
                this.client.logger.info("Evse already enabled");
            }

        } else if (!argv.json) {
            this.client.logger.info("Evse not registered");
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

        const evse = await this.client.sc.evses.getByUid(argv.id);

        if (!argv.json) {
            this.client.logger.info(`Starting charge on ${evse.id} for ${argv.seconds} seconds...`);
        }

        if (!evse.owner.startsWith("0x00")) {

            // only charge if available
            if (evse.available) {

                await this.client.sc.charging.useWallet(this.client.wallet).requestStart(evse, this.client.sc.token.address, argv.price);
                result.success = true;

                if (!argv.json) {
                    this.client.logger.info(`Charge started on Evse with uid: ${evse.uid}`);
                }

            } else if (!argv.json) {
                this.client.logger.warn("Evse not available");
            }

        } else if (!argv.json) {
            this.client.logger.warn("Evse not registered");
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

        const evse = await this.client.sc.evses.getByUid(argv.id);

        if (!argv.json) {
            this.client.logger.info("Stopping charge on evse with ID:", evse.uid);
        }

        if (!evse.owner.startsWith("0x00")) {

            // only stop if not available
            if (!evse.available) {

                await this.client.bridge.stop(result);
                const cdr = await this.client.bridge.cdr(result);

                await this.client.sc.charging.useWallet(this.client.wallet).confirmStop(evse);

                result.success = true;

                if (!argv.json) {
                    this.client.logger.info("Charge stopped");
                }

            } else if (!argv.json) {
                this.client.logger.warn("Evse not charging, nothing to stop");
            }

        } else if (!argv.json) {
            this.client.logger.warn("Evse not registered");
        }

        if (argv.json) {
            console.log(JSON.stringify(result, null, 2));
        } else {
            this.client.logger[result.success ? "info" : "warn"]("Success:", result.success);
        }

        return result;
    };
}
