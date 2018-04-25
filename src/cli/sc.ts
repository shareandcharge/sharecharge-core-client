import * as yargs from "yargs";
import bridgeHandler from "./bridge"
import evseHandler from "./evse";
import clientHandler from "./client"
import stationHandler from "./station"
import chargingHandler from "./charging"

const argv = yargs
    .usage("Usage: sc <command> [options]")
    .version("0.0.1")
    .alias("v", "version")
    .alias("h", "help")
    .option("json", {
        describe: "generate json output"
    })
    .command("evse", "evse commands", evseHandler, (argv) => {
        // this command has sub commands, exit
        yargs.showHelp();
    })
    .command("station", "station commands", stationHandler, (argv) => {
        // this command has sub commands, exit
        yargs.showHelp();
    })
    .command("bridge", "Bridge commands", bridgeHandler, (argv) => {
        // this command has sub commands, exit
        yargs.showHelp();
    })
    .command("client", "Run the S&C Core Client", clientHandler, (argv) => {
        // this command has sub commands, exit
        yargs.showHelp();
    })
    .command("charging", "charging commands", chargingHandler, (argv) => {
        // this command has sub commands, exit
        yargs.showHelp();
    })
    .demandCommand(1)
    .argv;
