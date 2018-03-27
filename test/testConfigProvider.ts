import { injectable, inject } from "inversify";
import ConfigProvider from "../src/services/configProvider";

@injectable()
export default class TestConfigProvider extends ConfigProvider {

    constructor() {
        super();

        super.config = ConfigProvider.loadConfigFromFile("../../test/test-config.yaml")
    }
}