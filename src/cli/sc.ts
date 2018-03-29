import * as yargs from "yargs";
import bridgeHandler from "./bridge"
import cpHandler from "./evse";
import { clientHandler } from "./client"

const argv = yargs
    .usage("Usage: sc <command> [options]")
    .version("0.0.1")
    .alias("v", "version")
    .alias("h", "help")
    .option("json", {
        describe: "generate json output"
    })
    .command("evse", "evse commands", cpHandler, (argv) => {
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
    .demandCommand(1)
    .argv;
