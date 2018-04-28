import StorageLogic from "./storage.logic";
import ConfigProvider from "../../services/configProvider";

const storageLogic = new StorageLogic();

export default (yargs) => {
    yargs
        .usage("Usage: sc store <command> [options]")
        .config("config", "Path to plaintext config file", ConfigProvider.loadConfigFromFile)
        .demandCommand(1)

        .command("add-locations",
            "Add a location (charge point) on the Share&Charge EV Network",
            (yargs) => {

                yargs
                    .option("file", {
                        alias: 'f',
                        describe: 'specify json file path containing array of location objects',
                        demand: true
                    });

            }, storageLogic.addLocation)

        .command("get-locations",
            "Retrieve a location (charge point) on the Share&Charge EV Network",
            (yargs) => {

                yargs
                    .option("cpo", {
                        alias: 'c',
                        describe: 'the address of the Charge Point Operator',
                    })
                    .option("id", {
                        alias: 'i',
                        describe: 'the global identifier of the Charge Point'
                    })
                    .string("_")
            }, storageLogic.getLocation)
    }