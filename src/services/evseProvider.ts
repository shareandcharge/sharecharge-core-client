import { injectable, inject } from "inversify";
import * as path from "path";
import IClientConfig from "../models/iClientConfig";
import { Symbols } from "../symbols";
import * as fs from "fs";

@injectable()
export default class EvseProvider {

    private evses: any[];

    constructor(@inject(Symbols.ConfigProvider) private configProvider: IClientConfig) {
        this.evses = EvseProvider.loadEvsesFromPath(this.configProvider.evsesPath);
    }

    private static loadEvsesFromPath(evsesPath) {

        const fullPath = path.join(__dirname, evsesPath);

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
        return this.evses;
    }
}