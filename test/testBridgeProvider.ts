import { injectable, inject } from "inversify";
import ConfigProvider from "../src/services/configProvider";
import BridgeProvider from "../src/services/bridgeProvider";
import { Symbols } from "../src/symbols";

@injectable()
export default class TestBridgeProvider extends BridgeProvider {

    public static backend = {};
    public static healthy: boolean = true;

    constructor(@inject(Symbols.ConfigProvider) configProvider: ConfigProvider) {
        super(configProvider);
    }

    obtain() {
        const bridge = super.obtain();

        bridge.evseStatus = async (id: string): Promise<any> => {

            return TestBridgeProvider.backend[id].available;
        };

        bridge.health = async (): Promise<any> => {
            return TestBridgeProvider.healthy;
        };

        return bridge;
    }
}