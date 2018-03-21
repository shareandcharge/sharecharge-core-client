import { loadConfigFromFile } from '../utils/config';
import IClientConfig from "../models/iClientConfig";

const config: IClientConfig = loadConfigFromFile('./config/config.yaml');

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

                result.name = config.bridge.name;

                config.bridge.health()
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