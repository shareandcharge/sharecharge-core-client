import { loadConfigFromFile } from "../utils/config";
import { logger } from "../utils/logger";

export default class ClientLogic {

    private config;

    constructor(configPath: string) {

        this.config = loadConfigFromFile(configPath);
    }

    public start = async (argv) => {

        const config = argv.config ? argv : this.config;

        if (!config.id) {
            logger.warn('No Client ID found in configuration!');
        }

        if (!config.pass) {
            logger.warn('No Ethereum password found in configuration!');
        }

        // todo start client ;)

        return true;
    };
}