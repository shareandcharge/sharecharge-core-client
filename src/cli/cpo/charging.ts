import ChargingLogic from "./charging.logic";
import ConfigProvider from "../../services/configProvider";

const chargingLogic = new ChargingLogic();

export default (yargs) => {

    yargs
    .usage("Usage: sc charging <command> [options]")
    .config("config", "Path to plaintext config file", ConfigProvider.loadConfigFromFile)
    .demandCommand(1)

    /*
        state (session) data is currently private on charging contract!
    */
    
    //     .command("sessions",
    //         "Lists all current charging session",
    //         (yargs) => {

    //         }, chargingoLogic.sessions)

        .command("request-start",
            "Request a charging session to start at a particular location",
            (yargs) => {
                yargs
                    .option("sc-id", {
                        alias: 's',
                        describe: 'The unique Share&Charge identifier for the location',
                        demand: true
                    })
                    .option("evse-id", {
                        alias: 'e',
                        describe: 'An identifier for the EVSE at the location',
                        demand: true
                    })
                    .option("token", {
                        alias: 't',
                        describe: 'The token address used to transfer funds for the charging session'
                    })
                    .option("amount", {
                        alias: 'a',
                        describe: 'The estimated amount of tokens that the charging session will cost',
                        default: 0
                    })
            }, chargingLogic.requestStart)

        .command("confirm-start",
            "Confirm the start of a charging session at a particular location",
            (yargs) => {
                yargs
                    .option("sc-id", {
                        alias: 's',
                        describe: 'The unique Share&Charge identifier for the location',
                        demand: true
                    })
                    .option("evse-id", {
                        alias: 'e',
                        describe: 'An identifier for the EVSE at the location',
                        demand: true
                    })
                    .option("session-id", {
                        describe: 'The token address used to transfer funds for the charging session',
                        default: '0x01'
                    })
            }, chargingLogic.confirmStart)

        .command("request-stop",
            "Request a charging session to end at a particular location",
            (yargs) => {
                yargs
                    .option("sc-id", {
                        alias: 's',
                        describe: 'The unique Share&Charge identifier for the location',
                        demand: true
                    })
                    .option("evse-id", {
                        alias: 'e',
                        describe: 'An identifier for the EVSE at the location',
                        demand: true
                    })
            }, chargingLogic.requestStop)

        .command("confirm-stop",
            "Confirm the end of a charging session at a particular location",
            (yargs) => {
                yargs
                    .option("sc-id", {
                        alias: 's',
                        describe: 'The unique Share&Charge identifier for the location',
                        demand: true
                    })
                    .option("evse-id", {
                        alias: 'e',
                        describe: 'An identifier for the EVSE at the location',
                        demand: true
                    })
            }, chargingLogic.confirmStop)

}
