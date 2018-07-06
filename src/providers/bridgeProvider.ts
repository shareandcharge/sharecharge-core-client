import { IConfig, IBridge } from "@motionwerk/sharecharge-common/dist/common"
import ConfigProvider from "./configProvider"

export default class BridgeProvider {

    private bridge;

    constructor(private configProvider: ConfigProvider) {
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