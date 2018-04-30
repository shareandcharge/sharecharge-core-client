import * as yargs from "yargs";
import bridgeHandler from "./cpo/bridge";
import evseHandler from "./cpo/evse";
import clientHandler from "./client";
import stationHandler from "./cpo/station";
import chargingHandler from "./cpo/charging";
import tokenHandler from "./msp/token";
import storageHandler from "./cpo/storage";
import cdrHandler from "./cpo/cdr";

const argv = yargs
    .usage("Usage: sc <command> [options]")
    .version("0.0.1")
    .alias("v", "version")
    .alias("h", "help")
    .option("json", {
        describe: "generate json output"
    })
    .command("evse", "Add and query evse data", evseHandler, (argv) => {
        // this command has sub commands, exit
        yargs.showHelp();
    })
    .command("station", "Add and query station data", stationHandler, (argv) => {
        // this command has sub commands, exit
        yargs.showHelp();
    })
    .command("bridge", "Query the connected Bridge", bridgeHandler, (argv) => {
        // this command has sub commands, exit
        yargs.showHelp();
    })
    .command("client", "Run the Share&Charge Core Client", clientHandler, (argv) => {
        // this command has sub commands, exit
        yargs.showHelp();
    })
    .command("charging", "Command EV charging sessions", chargingHandler, (argv) => {
        // this command has sub commands, exit
        yargs.showHelp();
    })
    .command("token", "Deploy and manage a Mobility Service Provider token", tokenHandler, (argv) => {
        yargs.showHelp();
    })
    .command("store", "Add and query data stored on the Share&Charge EV Network", storageHandler, (argv) => {
        yargs.showHelp();
    })
    .command("cdr", "Charge detail record", cdrHandler, (argv) => {
        yargs.showHelp();
    })
    .demandCommand(1)
    .argv;
