import ChargingLogic from "./charging.logic";
import ConfigProvider from "../services/configProvider";

const chargingoLogic = new ChargingLogic();

export default (yargs) => {

    yargs
        .usage("Usage: sc charging <command> [options]")
        .config("config", "Path to plaintext config file", ConfigProvider.loadConfigFromFile)
        .demandCommand(1)

        .command("sessions",
            "Lists all current charging session",
            (yargs) => {

            }, chargingoLogic.sessions)
}
