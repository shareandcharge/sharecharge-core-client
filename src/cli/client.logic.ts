import IClientConfig from "../models/iClientConfig";

export default class ClientLogic {

    constructor(private config: IClientConfig) {
    }

    public start = async (argv) => {

        const config = argv.config ? argv : this.config;

        if (!config.id) {
            this.config.logger.warn('No Client ID found in configuration!');
        }

        if (!config.pass) {
            this.config.logger.warn('No Ethereum password found in configuration!');
        }

        // todo start client ;)

        return true;
    };
}