import { injectable, inject } from "inversify";
import * as path from "path";
import IClientConfig from "../models/iClientConfig";
import Parser from "../utils/parser";

@injectable()
export default class ConfigProvider implements IClientConfig {

    protected config: IClientConfig;

    constructor() {
        this.config = ConfigProvider.loadConfigFromFile("../../config/config.yaml")
    }

    get bridgePath() {
        return this.config.bridgePath;
    }

    get stationsPath() {
        return this.config.stationsPath;
    }

    get gasPrice() {
        return this.config.gasPrice || 2;
    }

    get seed() {
        return this.config.seed;
    }

    get stage() {
        return this.config.stage || "local";
    }

    get provider() {
        return this.config.provider;
    }

    public static loadConfigFromFile(filename: string): IClientConfig {
        const configPath = filename.startsWith("/") ? filename : path.join(__dirname, filename);
        const parser = new Parser();
        //console.log("reading config from", configPath);
        const configString = parser.read(configPath);
        return <IClientConfig>ConfigProvider.createConfig(parser.translate(configString))
    };

    private static createConfig(argv: any): IClientConfig {
        return <IClientConfig>{
            bridgePath: argv.bridgePath,
            evsesPath: argv.evsesPath,
            stationsPath: argv.stationsPath,
            stage: argv.stage,
            seed: argv.seed,
            gasPrice: argv.gasPrice,
            provider: argv.provider
        };
    };
}