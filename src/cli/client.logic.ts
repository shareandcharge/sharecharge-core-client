import LogicBase from "./logicBase"
import ShareChargeCoreClient from "../shareChargeCoreClient";

export default class ClientLogic extends LogicBase {

    public start = async (argv) => {

        if (!this.client.config.seed) {
            this.client.logger.warn("No seed configured!");
        }

        ShareChargeCoreClient.getInstance().run();

        return true;
    };
}