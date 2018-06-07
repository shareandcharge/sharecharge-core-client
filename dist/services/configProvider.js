"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ConfigProvider_1;
"use strict";
const inversify_1 = require("inversify");
const fs = require("fs");
const sharecharge_common_1 = require("@motionwerk/sharecharge-common");
sharecharge_common_1.prepareConfigLocation();
let ConfigProvider = ConfigProvider_1 = class ConfigProvider {
    constructor() {
        this.config = ConfigProvider_1.load(sharecharge_common_1.getConfigDir() + "config.json");
    }
    static load(file) {
        return JSON.parse(fs.readFileSync(file, "UTF8"));
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
    get ethProvider() {
        return this.config.ethProvider;
    }
    get ipfsProvider() {
        return this.config.ipfsProvider;
    }
    get tokenAddress() {
        return this.config.tokenAddress;
    }
    static loadConfigFromFile(configPath) {
        return ConfigProvider_1.createConfig(ConfigProvider_1.load(configPath));
    }
    ;
    static createConfig(argv) {
        return {
            locationsPath: argv.locationsPath,
            tariffsPath: argv.tariffsPath,
            bridgePath: argv.bridgePath,
            stage: argv.stage,
            seed: argv.seed,
            gasPrice: argv.gasPrice,
            ethProvider: argv.ethProvider,
            ipfsProvider: argv.ipfsProvider,
            tokenAddress: argv.tokenAddress
        };
    }
    ;
};
ConfigProvider = ConfigProvider_1 = __decorate([
    inversify_1.injectable(),
    __metadata("design:paramtypes", [])
], ConfigProvider);
exports.default = ConfigProvider;
//# sourceMappingURL=configProvider.js.map