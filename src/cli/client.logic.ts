import { loadConfigFromFile } from "../utils/config";
import { logger } from "../utils/logger";

export const start = (argv) => {

    const config = argv.config ? argv : loadConfigFromFile("./config/config.yaml");

    if (!config.id) {
        logger.warn('No Client ID found in configuration!');
    }

    if (!config.pass) {
        logger.warn('No Ethereum password found in configuration!');
    }

    // todo start client ;)
};