import StationLogic from "./station.logic";
import ConfigProvider from "../../services/configProvider";

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

        .command("start [id] [seconds] [energy]",
            "Start a charging session at a given Station",
            (yargs) => {
                yargs
                    .positional("id", {
                        describe: "a unique identifier for the Charge Point",
                        type: "string",
                    })
                    .positional("seconds", {
                        describe: "time to rent in seconds",
                        type: "number",
                        default: 10
                    })
                    .positional("energy", {
                        describe: "scotty, energy",
                        type: "number",
                        default: 22
                    })
                    .string("_")
                    .demand("id")

            }, stationLogic.start)
}
