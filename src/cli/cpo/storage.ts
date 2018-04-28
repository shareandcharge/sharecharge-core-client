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
                        describe: 'json file path containing array of location objects',
                        demand: true
                    });

            }, storageLogic.addLocation)

        .command("get-locations",
            "Retrieve a location (charge point) from the Share&Charge EV Network",
            (yargs) => {

                yargs
                    .option("cpo", {
                        alias: 'c',
                        describe: 'address of the Charge Point Operator (default: your wallet)',
                    })
                    .option("id", {
                        alias: 'i',
                        describe: 'global identifier of a Charge Point'
                    })
                    .string("_")
            }, storageLogic.getLocation)

        .command("add-tariffs",
            "Add tariffs data on the Share&Charge EV Network",
            (yargs) => {

                yargs
                    .option("file", {
                        alias: 'f',
                        describe: 'json file path containing tariffs data',
                        demand: true
                    })

            }, storageLogic.addTariffs)

        .command("get-tariffs",
            "Retrieve CPO tariffs from the Share&Charge EV Network",
            (yargs) => {

                yargs
                    .option("cpo", {
                        alias: 'c',
                        describe: 'address of the Charge Point Operator (default: your wallet)'
                    })

            }, storageLogic.getTariffs);

    }