import { injectable, inject } from "inversify";
import * as path from "path";
import { IConfig } from "@motionwerk/sharecharge-config"
import { Symbols } from "../symbols";
import IBridge from "../interfaces/iBridge";

@injectable()
export default class BridgeProvider {

    private bridge;

    constructor(@inject(Symbols.ConfigProvider) private configProvider: IConfig) {
        this.bridge = BridgeProvider.createBrideInstance(this.configProvider.bridgePath);
    }

    private static createBrideInstance(bridgePath: string): IBridge {

        const bridgeFullPath = path.join(__dirname, bridgePath);
        const Bridge = require(bridgeFullPath).default;

        return new Bridge();
    }

    obtain() {
        return this.bridge;
    }
}