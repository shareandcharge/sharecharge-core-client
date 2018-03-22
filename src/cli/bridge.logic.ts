import IClientConfig from "../models/iClientConfig";

export default class BridgeLogic {

    constructor(private config: IClientConfig) {
    }

    public status = async (argv) => {

        let result: any = {
            name: null,
            bridge: {
                isAvailable: null
            }
        };

        if (!argv.json) {
            this.config.logger.info("Getting status of bridge.");
        }

        result.name = this.config.bridge.name;
        result.bridge.isAvailable = await this.config.bridge.health();

        if (argv.json) {
            this.config.logger.info(JSON.stringify(result, null, 2));
        } else {
            this.config.logger.info("Bridge Available:", result.bridge.isAvailable);
            this.config.logger.info("Bridge name:", result.name)
        }

        return result;
    };
}