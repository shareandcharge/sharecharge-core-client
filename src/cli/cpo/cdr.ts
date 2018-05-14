import CdrLogic from './cdr.logic';
import ConfigProvider from "../../services/configProvider";

const cdrLogic = new CdrLogic();

export default (yargs) => {

    yargs
        .usage("Usage: sc cdr <command> [options]")
        .config("config", "Path to plaintext config file", ConfigProvider.loadConfigFromFile)
        .demandCommand(1)

        .command("info",
            "display informations and details",
            (yargs) => {
                yargs
                    .option("transactionHash", {
                        alias: "t",
                        describe: "Filter the logs by transactionHash"
                    })
                    .option("address", {
                        alias: "a",
                        describe: "Filter the logs by address"
                    })
                    .option("controller", {
                        alias: "c",
                        describe: "Filter the logs by controller"
                    })
                    .option("evseId", {
                        alias: "e",
                        describe: "Filter the logs by evseId"
                    })
                    .option("tokenAddress", {
                        alias: "o",
                        describe: "Filter the logs by tokenAddress",
                    })
                    .option("date", {
                        alias: "d",
                        describe: "Filter the logs by date. Year-month-day format (2018-04-01)",
                    })

            }, cdrLogic.getInfo)
}