import { injectable, inject } from "inversify";
import * as fs from "fs";
import { getConfigDir, IConfig, prepareConfigLocation } from "@motionwerk/sharecharge-config";

prepareConfigLocation();

@injectable()
export default class ConfigProvider implements IConfig {

    protected config: IConfig;

    static load(file): IConfig {

        return <IConfig>JSON.parse(fs.readFileSync(file, "UTF8"))
    }

    constructor() {
        this.config = ConfigProvider.load(getConfigDir() + "config.json");
    }

    get locationsPath() {
        return this.config.locationsPath;
    }

    get tariffsPath() {
        return this.config.tariffsPath;
    }

    get gasPrice() {
        return this.config.gasPrice || 2;
    }

    get seed() {
        return this.config.seed;
    }

    get bridgePath() {
        return this.config.bridgePath;
    }

    get stage() {
        return this.config.stage || "local";
    }

    get provider() {
        return this.config.provider;
    }

    get tokenAddress() {
        return this.config.tokenAddress;
    }

    public static loadConfigFromFile(configPath: string): IConfig {
        return <IConfig>ConfigProvider.createConfig(ConfigProvider.load(configPath))
    };

    private static createConfig(argv: any): IConfig {
        return <IConfig>{
            locationsPath: argv.locationsPath,
            tariffsPath: argv.tariffsPath,
            bridgePath: argv.bridgePath,
            stage: argv.stage,
            seed: argv.seed,
            gasPrice: argv.gasPrice,
            ethProvider: argv.ethProvider,
            tokenAddress: argv.tokenAddress
        };
    };
}