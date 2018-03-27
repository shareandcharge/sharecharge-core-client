import ClientLogic from "./client.logic";
import ConfigProvider from "../services/configProvider";

const clientLogic = new ClientLogic();

export const clientHandler = (yargs) => {
    yargs
        .usage("Usage: sc client [options]")
        .config("config", "Path to plaintext config file", ConfigProvider.loadConfigFromFile)
        .options({
            "id": {
                describe: "The client ID used to filter EV charge requests",
                type: "string"
            },
            "seed": {
                describe: "The password of the user\'s Ethereum address for confirming charge sessions",
                type: "string",
                default: ""
            },
            "bridgePath": {
                describe: "Path to the bridge which the Core Client should connect to",
                type: "string"
            },
            "connectorsPath": {
                describe: "Path to the connector data if registration of connectors required",
                type: "string"
            },
            "stage": {
                describe: "Specify on what stage we want to be",
                type: "string"
            },
        })

        .command("start",
            "Starts the client", (yargs) => {
            }, clientLogic.start)
};