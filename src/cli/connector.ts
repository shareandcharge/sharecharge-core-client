import { loadConfigFromFile } from "../utils/config";
import ConnectorLogic from "./connector.logic";

const connectorLogic = new ConnectorLogic("./config/config.yaml");

export default (yargs) => {

    yargs
        .usage("Usage: sc cp <command> [options]")
        .config("config", "Path to plaintext config file", loadConfigFromFile)
        .demandCommand(1)

        .command("register [id]",
            "Registers a Charge Point with given id in the EV Network",
            (yargs) => {

                yargs
                    .command("all",
                        "Registers all Charge Points in the EV Network",
                        (yargs) => {
                            // no id in this case, srly
                            yargs.default("id", "");
                        }, connectorLogic.registerAll);

                yargs
                    .positional("id", {
                        describe: "a unique identifier for the Charge Point",
                        type: "string"
                    })
                    .string("_")
                    .demand("id");

            }, connectorLogic.register)

        .command("status [id]",
            "Returns the current status of the Charge Point with given id",
            (yargs) => {
                yargs
                    .positional("id", {
                        describe: "a unique identifier for the Charge Point",
                        type: "string"
                    })
                    .string("_")
                    .demand("id")
            }, connectorLogic.status)

        .command("info [id]",
            "Returns the current info of the Charge Point with given id",
            (yargs) => {

                yargs
                    .command("all",
                        "Lists all Charge Points in the EV Network that you own",
                        (yargs) => {
                            // no id in this case, srly
                            yargs.default("id", "");
                        }, connectorLogic.infoAll);

                yargs
                    .positional("id", {
                        describe: "a unique identifier for the Charge Point",
                        type: "string"
                    })
                    .string("_")
                    .demand("id");

            }, connectorLogic.info)

        .command("disable [id]",
            "Disables the Charge Point with given id",
            (yargs) => {
                yargs
                    .positional("id", {
                        describe: "a unique identifier for the Charge Point",
                        type: "string"
                    })
                    .string("_")
                    .demand("id");
            }, connectorLogic.disable)

        .command("enable [id]",
            "Enables the Charge Point with given id",
            (yargs) => {
                yargs
                    .positional("id", {
                        describe: "a unique identifier for the Charge Point",
                        type: "string"
                    })
                    .string("_")
                    .demand("id");
            }, connectorLogic.enable)

        .command("start [id] [seconds]",
            "Start a charging session at a given Charge Point",
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
                    .string("_")
                    .demand("id")

            }, connectorLogic.start)

        .command("stop [id]",
            "Stops a charging session at a given Charge Point",
            (yargs) => {
                yargs
                    .positional("id", {
                        describe: "a unique identifier for the Charge Point",
                        type: "string"
                    })
                    .string("_")
                    .demand("id")
            }, connectorLogic.stop);
}
