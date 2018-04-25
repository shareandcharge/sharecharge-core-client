import MspLogic from "./msp.logic";
import ConfigProvider from "../services/configProvider";

const mspLogic = new MspLogic();

export default (yargs) => {
    yargs
        .usage("Usage: sc msp <command> [options]")
        .config("config", "Path to plaintext config file", ConfigProvider.loadConfigFromFile)
        .demandCommand(1)

        .command("deploy-token",
            "Deploy a new MSP Token Contract (warning: high gas cost!)",
            yargs => {
                yargs
                    .option("name", {
                        alias: "n",
                        describe: "the public name of your token (e.g. My MSP Token)",
                        type: "array"
                    })
                    .demand("name");
                
                yargs
                    .option("symbol", {
                        alias: "s",
                        describe: "the short identifier of your token (e.g. MSP)",
                        type: "string"
                    })
                    .demand("symbol");
            }, mspLogic.deploy)

        .command("set-access",
            "Authorize a Charging Contract to transfer driver funds to and from an escrow account",
            yargs => {
                yargs
                    .option("charging", {
                        alias: "c",
                        describe: "the Charging contract address",
                        type: "string"
                    })
                    .string("_")
                    .demand("charging")
            }, mspLogic.setAccess)

        .command("mint",
            "Mint tokens for an EV driver",
            yargs => {
                yargs
                    .option("driver", {
                        alias: "d",
                        describe: "the address of the driver to fund",
                        type: "string"
                    })
                    .string("_")
                    .demand("driver");

                yargs
                    .option("amount", {
                        alias: "a",
                        describe: "the amount of tokens to fund",
                        type: "number"
                    })
                    .demand("amount")
            }, mspLogic.mint)

        .command("balance",
            "Check balance of EV driver",
            yargs => {
                yargs
                    .option("driver", {
                        alias: "d",
                        describe: "the address of the driver",
                        type: "string"
                    })
                    .string("_")
                    .demand("driver")
            }, mspLogic.balance)

        .command("info",
            "Check MSP Token information",
            {},
            mspLogic.info)
}