import StationLogic from "./station.logic";
import ConfigProvider from "../services/configProvider";

const stationLogic = new StationLogic();

export default (yargs) => {

    yargs
        .usage("Usage: sc station <command> [options]")
        .config("config", "Path to plaintext config file", ConfigProvider.loadConfigFromFile)
        .demandCommand(1)

        .command("register [id]",
            "Registers a Station with given id in the EV Network",
            (yargs) => {

                yargs
                    .command("all",
                        "Registers all Stations in the EV Network",
                        (yargs) => {
                            // no id in this case, srly
                            yargs.default("id", "");
                        }, stationLogic.registerAll);

                yargs
                    .positional("id", {
                        describe: "a unique identifier for the Station",
                        type: "string"
                    })
                    .string("_")
                    .demand("id");

            }, stationLogic.register)
}
