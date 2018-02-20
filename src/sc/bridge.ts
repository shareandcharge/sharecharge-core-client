import {config} from "../../config";

const bridge = config.bridge;

export default (yargs) => {

    yargs
        .usage("Usage: sc bridge <command> [options]")
        .demandCommand(1);

    yargs
        .command("status",
            "Returns the current status of the configured Bridge", {},
            (argv) => {

                let result: any = {
                    name: null,
                    bridge: {
                        isAvailable: null
                    }
                };

                if (!argv.json) {
                    console.log("Getting status of bridge.");
                }

                result.name = bridge.name;

                bridge.health()
                    .then(isAvailable => {

                        result.bridge.isAvailable = isAvailable;

                        if (argv.json) {
                            console.log(JSON.stringify(result, null, 2));
                        } else {
                            console.log("Bridge Available:", result.bridge.isAvailable);
                            console.log("Bridge name:", result.name)
                        }
                    });
            });

};