import LogicBase from "./LogicBase"

export default class ClientLogic extends LogicBase {

    public start = async (argv) => {

        if (!this.client.config.seed) {
            this.client.logger.warn("No seed configured!");
        }

        // todo start client ;)

        return true;
    };
}