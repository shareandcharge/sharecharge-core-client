import { loadConfigFromFile } from '../utils/config';
import IClientConfig from "../models/iClientConfig";
import BridgeLogic from "./bridge.logic";

const config: IClientConfig = loadConfigFromFile('./config/config.yaml');

const bridgeLogic = new BridgeLogic(config);

export default (yargs) => {

    yargs
        .usage("Usage: sc bridge <command> [options]")
        .demandCommand(1);

    yargs
        .command("status",
            "Returns the current status of the configured Bridge", {}, bridgeLogic.status);

};