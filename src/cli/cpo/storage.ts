import StorageLogic from "./storage.logic";
import ConfigProvider from "../../services/configProvider";

const storageLogic = new StorageLogic();

export default (yargs) => {
    yargs
        .usage("Usage: sc store <command> [options]")
        .config("config", "Path to plaintext config file", ConfigProvider.loadConfigFromFile)
        .demandCommand(1)

        .command("add-locations",
            "Add a location (charge point) with on the Share&Charge EV Network",
            (yargs) => {

                yargs
                    .option("file", {
                        alias: 'f',
                        describe: 'specify json file path containing array of location objects',
                        demand: true
                    });

            }, storageLogic.addLocation)
    }