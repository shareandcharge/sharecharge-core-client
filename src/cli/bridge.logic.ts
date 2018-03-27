import LogicBase from "./LogicBase"

export default class BridgeLogic extends LogicBase {

    public status = async (argv) => {

        let result: any = {
            name: null,
            bridge: {
                isAvailable: null
            }
        };

        if (!argv.json) {
            this.client.logger.info("Getting status of bridge.");
        }

        result.name = this.client.bridge.name;
        result.bridge.isAvailable = await this.client.bridge.health();

        if (argv.json) {
            this.client.logger.info(JSON.stringify(result, null, 2));
        } else {
            this.client.logger.info("Bridge Available:", result.bridge.isAvailable);
            this.client.logger.info("Bridge name:", result.name)
        }

        return result;
    };
}