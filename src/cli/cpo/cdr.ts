import CdrLogic from './cdr.logic';
import ConfigProvider from "../../services/configProvider";

const cdrLogic = new CdrLogic();

export default (yargs) => {

    yargs
        .usage("Usage: sc cdr <command> [options]")
        .config("config", "Path to plaintext config file", ConfigProvider.loadConfigFromFile)
        .demandCommand(1)

        .command("info",
            "display informations and details",
            (yargs) => {

            }, cdrLogic.getInfo)
}