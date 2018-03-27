import BridgeLogic from "./bridge.logic";

const bridgeLogic = new BridgeLogic();

export default (yargs) => {

    yargs
        .usage("Usage: sc bridge <command> [options]")
        .demandCommand(1);

    yargs
        .command("status",
            "Returns the current status of the configured Bridge", {}, bridgeLogic.status);

};