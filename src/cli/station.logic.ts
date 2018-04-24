import { Station, OpeningHours, ToolKit } from "@motionwerk/sharecharge-lib";
import LogicBase from "./logicBase"

export default class StationLogic extends LogicBase {

    public register = async (argv) => {

        if (!argv.json) {
            this.client.logger.info(`Registering station with id: ${argv.id}`);
        }

        let result: any = {
            id: argv.id,
            success: false
        };

        const stationToRegister = this.client.stations[argv.id];

        if (stationToRegister) {
            const uid = ToolKit.asciiToHex(argv.id);

            let station: Station = await this.client.sc.stations.getById(uid);
            let success = false;

            if (station.owner.startsWith("0x00")) {

                station = Station.deserialize({id: uid, openingHours: "0x0"});
                station.latitude = stationToRegister.latitude;
                station.longitude = stationToRegister.longitude;
                station.openingHours = OpeningHours.decode(stationToRegister.openingHours);

                await this.client.sc.stations.useWallet(this.client.wallet).create(station);

                success = true;

                if (!argv.json) {
                    this.client.logger.info(`station with id '${uid}' created`);
                }
            } else if (!argv.jso) {
                this.client.logger.warn(`station with id '${uid}' already registerterd`);
            }

            result = {
                id: station.id,
                owner: station.owner,
                latitude: station.latitude,
                longitude: station.longitude,
                openingHours: station.openingHours,
                success
            }

        } else if (!argv.json) {
            this.client.logger.error(`No station found with id ${argv.id} in configuration.`);
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
            this.client.logger.info("Registering all stations from the configuration");
        }

        let results: any = {};
        const stations: Station[] = [];

        const stationIds = Object.keys(this.client.stations);

        for (let stationId of stationIds) {

            const stationToRegister = this.client.stations[stationId];
            const stationIdHex = ToolKit.asciiToHex(stationId);

            let station: Station = await this.client.sc.stations.getById(stationIdHex);

            results[stationId] = {
                id: stationId,
                owner: station.owner,
                latitude: station.latitude,
                longitude: station.longitude,
                openingHours: station.openingHours,
                success: false
            };

            if (station.owner.startsWith("0x00")) {

                station = Station.deserialize({id: stationIdHex, openingHours: "0x0"});
                results[stationId].latitude = stationToRegister.latitude;
                station.latitude = stationToRegister.latitude;
                results[stationId].longitude = stationToRegister.longitude;
                station.longitude = stationToRegister.longitude;
                results[stationId].openingHours = stationToRegister.openingHours;
                station.openingHours = OpeningHours.decode(stationToRegister.openingHours);

                stations.push(station);

            } else if (!argv.json) {
                this.client.logger.warn(`Station with id '${stationId}' already registered!`);
            }
        }

        if (stations.length > 0) {
            await this.client.sc.stations.useWallet(this.client.wallet).batch().create(...stations);
        }

        for (let station of stations) {

            const stationId = ToolKit.hexToString(station.id);
            results[stationId].success = true;

            if (!argv.json) {
                this.client.logger.info(`Station with id '${stationId}' created`);
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
            this.client.logger.info(`All done, ${stations.length} Stations created`);
        }

        return results;
    };

    public start = async (argv) => {

        if (!argv.json) {
            this.client.logger.info(`Starting charge with station with id: ${argv.id}`);
        }

        let result: any = {
            id: argv.id,
            success: false
        };

        const station = await this.client.sc.stations.getById(ToolKit.asciiToHex(argv.id));

        if (await this.client.sc.evses.anyFree(station)) {

            const evses = await this.client.sc.evses.getByStation(station);

            for (let i = 0; i < evses.length; i++) {

                const evse = evses[i];

                // find out what evse to start from the brige?
                if (evse.available) {
                    await this.client.sc.charging.useWallet(this.client.wallet).requestStart(evse, argv.seconds, argv.energy);
                    result.success = true;
                    if (!argv.json) {
                        this.client.logger.info(`Started charge on evse with uid ${evse.uid}`);
                    }
                    break;
                }
            }

        } else if (argv.json) {
            this.client.logger.error("No evse free");
        }

        return result;
    };
}
