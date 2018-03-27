import { injectable, inject } from "inversify";
import * as path from "path";
import IClientConfig from "../models/iClientConfig";
import { Symbols } from "../symbols";
import * as fs from "fs";

@injectable()
export default class ConnectorsProvider {

    private connectors: any[];

    constructor(@inject(Symbols.ConfigProvider) private configProvider: IClientConfig) {
        this.connectors = ConnectorsProvider.loadConnectorsFromPath(this.configProvider.connectorsPath);
    }

    private static loadConnectorsFromPath(connectorPath) {

        const fullPath = path.join(__dirname, connectorPath);

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
        return this.connectors;
    }
}