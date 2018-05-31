import { injectable, inject } from "inversify";
import { IConfig, IBridge } from "@motionwerk/sharecharge-common"
import { Symbols } from "../symbols";
import ConfigProvider from "./configProvider"

@injectable()
export default class BridgeProvider {

    private bridge;

    constructor(@inject(Symbols.ConfigProvider) private configProvider: ConfigProvider) {
        this.bridge = BridgeProvider.createBridgeInstance(this.configProvider.bridgePath);
    }

    private static createBridgeInstance(bridgePath: string): IBridge {

        const Bridge = require(bridgePath).default;

        return new Bridge();
    }

    obtain() {
        return this.bridge;
    }
}