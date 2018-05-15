import { injectable, inject } from "inversify";
import * as path from "path";
import IClientConfig from "../interfaces/iClientConfig";
import { Symbols } from "../symbols";
import IBridge from "../interfaces/iBridge";

@injectable()
export default class BridgeProvider {

    private bridge;

    constructor(@inject(Symbols.ConfigProvider) private configProvider: IClientConfig) {
        this.bridge = BridgeProvider.createBrideInstance(this.configProvider.bridgePath);
    }

    private static createBrideInstance(bridgePath: string): IBridge {
        const bridgeFullPath = path.join(__dirname, bridgePath);

        //console.log("Bridgepath", bridgeFullPath);

        const Bridge = require(bridgeFullPath).default;
        return new Bridge();
    }

    obtain() {
        return this.bridge;
    }
}