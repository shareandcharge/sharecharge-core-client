import { Station, OpeningHours } from "sharecharge-lib";
import LogicBase from "./logicBase"

export default class StationLogic extends LogicBase {

    private async doRegister(stationToRegister, id, stfu) {

        let station: Station = await this.client.sc.stations.getById(id);
        let success = false;

        if (station.owner.startsWith("0x00")) {

            station = Station.deserialize({id, openingHours: "0x0"});
            station.latitude = stationToRegister.latitude;
            station.longitude = stationToRegister.longitude;
            station.openingHours = OpeningHours.decode(stationToRegister.openingHours);

            await this.client.sc.stations.useWallet(this.client.wallet).create(station);

            success = true;

            if (!stfu) {
                this.client.logger.info(`station with id ${id} created`);
            }
        } else if (!stfu) {
            this.client.logger.warn(`station with id ${id} already registerterd`);
        }

        return {
            id: station.id,
            owner: station.owner,
            latitude: station.latitude,
            longitude: station.longitude,
            openingHours: station.openingHours,
            success
        }
    }

    public register = async (argv) => {

        if (!argv.json) {
            this.client.logger.info(`Registering station with id: ${argv.id}`);
        }

        let result: any = {
            id: argv.id,
            success: false
        };

        const station = this.client.stations[argv.id];

        if (station) {
            result = await this.doRegister(station, argv.id, argv.json);
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
            let station: Station = await this.client.sc.stations.getById(stationId);

            results[stationId] = {
                id: station.id,
                owner: station.owner,
                latitude: station.latitude,
                longitude: station.longitude,
                openingHours: station.openingHours,
                success: false
            };

            if (station.owner.startsWith("0x00")) {

                station = Station.deserialize({id: stationId, openingHours: "0x0"});
                results[stationId].latitude = stationToRegister.latitude;
                station.latitude = stationToRegister.latitude;
                results[stationId].longitude = stationToRegister.longitude;
                station.longitude = stationToRegister.longitude;
                results[stationId].openingHours = stationToRegister.openingHours;
                station.openingHours = OpeningHours.decode(stationToRegister.openingHours);

                stations.push(station);

            } else if (!argv.json) {
                this.client.logger.warn(`Station with id ${stationId} already registered!`);
            }
        }

        if (stations.length > 0) {
            await this.client.sc.stations.useWallet(this.client.wallet).batch().create(...stations);
        }

        for (let station of stations) {
            results[station.id].success = true;

            if (!argv.json) {
                this.client.logger.info(`Station with id ${station.id} created`);
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

}
