import { Config } from './models/config';
import { Plugin } from './models/plugin';

export class Client {

    private readonly config: Config;
    private plugin: Plugin;

    constructor(config: Config) {
        this.config = config;
        this.plugin = this.config.plugin;
    }

    get pluginName(): string {
        return this.plugin.name;
    }
}