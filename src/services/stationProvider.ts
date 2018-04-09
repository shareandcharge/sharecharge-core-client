import { injectable, inject } from "inversify";
import * as path from "path";
import IClientConfig from "../models/iClientConfig";
import { Symbols } from "../symbols";
import * as fs from "fs";

@injectable()
export default class StationProvider {

    private stations: any[];

    constructor(@inject(Symbols.ConfigProvider) private configProvider: IClientConfig) {
        this.stations = StationProvider.loadStationsFromPath(this.configProvider.stationsPath);
    }

    private static loadStationsFromPath(stationsPath) {

        const fullPath = path.join(__dirname, stationsPath);

        // console.log("Conpath", fullPath);

        try {
            fs.statSync(fullPath);
            return require(fullPath);
        } catch (err) {
            console.log(err);
            return;
        }
    }

    obtain() {
        return this.stations;
    }
}