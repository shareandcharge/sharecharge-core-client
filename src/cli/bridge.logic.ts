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
            console.log("Getting status of bridge.");
        }

        result.name = this.config.bridge.name;
        result.bridge.isAvailable = await this.config.bridge.health();

        if (argv.json) {
            console.log(JSON.stringify(result, null, 2));
        } else {
            console.log("Bridge Available:", result.bridge.isAvailable);
            console.log("Bridge name:", result.name)
        }

        return result;
    };
}