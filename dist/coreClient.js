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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var CoreClient_1;
"use strict";
require("reflect-metadata");
const inversify_1 = require("inversify");
const loggingProvider_1 = require("./services/loggingProvider");
const symbols_1 = require("./symbols");
const configProvider_1 = require("./services/configProvider");
const shareChargeProvider_1 = require("./services/shareChargeProvider");
const bridgeProvider_1 = require("./services/bridgeProvider");
const walletProvider_1 = require("./services/walletProvider");
let CoreClient = CoreClient_1 = class CoreClient {
    constructor(configProvider, bridgeProvider, shareChargeProvider, walletProvider, loggingProvider) {
        this.configProvider = configProvider;
        this.bridgeProvider = bridgeProvider;
        this.shareChargeProvider = shareChargeProvider;
        this.walletProvider = walletProvider;
        this.loggingProvider = loggingProvider;
        this.scIds = [];
        this.tariffs = {};
    }
    get sc() {
        return this.shareChargeProvider.obtain(this.configProvider);
    }
    get coinbase() {
        return this.wallet.keychain[0].address;
    }
    get bridge() {
        return this.bridgeProvider.obtain();
    }
    get wallet() {
        return this.walletProvider.obtain();
    }
    get logger() {
        return this.loggingProvider.obtain();
    }
    get config() {
        return this.configProvider;
    }
    async getIds() {
        this.scIds = await this.sc.store.getIdsByCPO(this.coinbase);
    }
    async getTariffs() {
        this.tariffs = await this.sc.store.getTariffsByCPO(this.coinbase);
    }
    pollIds(interval = 5000) {
        setInterval(async () => await this.getIds(), interval);
    }
    pollTariffs(interval = 60000) {
        setInterval(async () => await this.getTariffs(), interval);
    }
    async createCdrParameters(scId, evseId) {
        // could be that the bridge has no way of knowing the base price so we get it here first
        const location = await this.sc.store.getLocationById(this.coinbase, scId);
        const evse = location.evses.filter(evse => evse['evse_id'] === evseId);
        // tariffs exist on connectors but the network currently does not care about which is in use
        // so we take the first tariff id for now
        const tariffId = evse[0].connectors[0]['tariff_id'];
        const tariff = this.tariffs.filter(tariff => tariff.id === tariffId);
        const price = tariff[0].elements[0]['price_components'][0].price;
        return {
            scId,
            evseId,
            price,
        };
    }
    listen() {
        this.sc.on("StartRequested", async (startRequestedEvent) => {
            this.logger.debug(`Start requested on ${startRequestedEvent.evseId}`);
            if (this.scIds.includes(startRequestedEvent.scId)) {
                try {
                    const startResult = await this.bridge.start({
                        scId: startRequestedEvent.scId,
                        evseId: startRequestedEvent.evseId,
                    });
                    if (startResult.success) {
                        await this.sc.charging.useWallet(this.wallet)
                            .confirmStart(startRequestedEvent.scId, startRequestedEvent.evseId, startResult.data.sessionId);
                        this.logger.info(`Confirmed ${startRequestedEvent.evseId} start`);
                    }
                }
                catch (err) {
                    this.logger.error(`Error starting ${startRequestedEvent.evseId}: ${err.message}`);
                    await this.sc.charging.useWallet(this.wallet).error(startRequestedEvent.scId, startRequestedEvent.evseId, 0);
                }
            }
        });
        this.sc.on("StopRequested", async (stopRequestedEvent) => {
            this.logger.debug(`Stop requested for evse with uid: ${stopRequestedEvent.scId}`);
            if (this.scIds.includes(stopRequestedEvent.scId)) {
                try {
                    const stopResult = await this.bridge.stop({
                        scId: stopRequestedEvent.scId,
                        evseId: stopRequestedEvent.evseId,
                        sessionId: stopRequestedEvent.sessionId
                    });
                    if (stopResult.success) {
                        const cdrParams = await this.createCdrParameters(stopRequestedEvent.scId, stopRequestedEvent.evseId);
                        const cdr = await this.bridge.cdr(cdrParams);
                        await this.sc.charging.useWallet(this.wallet)
                            .confirmStop(stopRequestedEvent.scId, stopRequestedEvent.evseId);
                        this.logger.info(`Confirmed ${stopRequestedEvent.evseId} stop`);
                        await this.sc.charging.useWallet(this.wallet)
                            .chargeDetailRecord(stopRequestedEvent.scId, stopRequestedEvent.evseId, cdr.price);
                        this.logger.info(`Confirmed ${stopRequestedEvent.evseId} CDR`);
                    }
                }
                catch (err) {
                    this.logger.error(`Error stopping ${stopRequestedEvent.evseId}: ${err.message}`);
                    await this.sc.charging.useWallet(this.wallet).error(stopRequestedEvent.scId, stopRequestedEvent.evseId, 1);
                }
            }
        });
        this.bridge.autoStop$.subscribe(async (autoStopEvent) => {
            try {
                const cdrParams = await this.createCdrParameters(autoStopEvent.scId, autoStopEvent.evseId);
                const cdr = await this.bridge.cdr(cdrParams);
                await this.sc.charging.useWallet(this.wallet)
                    .confirmStop(autoStopEvent.scId, autoStopEvent.evseId);
                this.logger.info(`Confirmed ${autoStopEvent.evseId} autostop`);
                await this.sc.charging.useWallet(this.wallet)
                    .chargeDetailRecord(autoStopEvent.scId, autoStopEvent.evseId, cdr.price);
                this.logger.info(`Confirmed ${autoStopEvent.evseId} CDR`);
            }
            catch (err) {
                this.logger.error(`Error confirming ${autoStopEvent.evseId} autostop: ${err.message}`);
                await this.sc.charging.useWallet(this.wallet).error(autoStopEvent.scId, autoStopEvent.evseId, 2);
            }
        });
        this.sc.startListening();
        this.logger.info(`Coinbase: ${this.coinbase}`);
        this.logger.info(`Connected to bridge: ${this.bridge.name}`);
        this.logger.info(`Listening for events`);
        this.logger.info(`Listening for these IDs: ${JSON.stringify(this.scIds)}`);
    }
    run() {
        this.getIds().then(async () => {
            await this.getTariffs();
            this.pollIds();
            this.pollTariffs();
            this.listen();
        });
    }
    static getInstance() {
        if (!CoreClient_1.container) {
            const container = new inversify_1.Container();
            container.bind(symbols_1.Symbols.ConfigProvider).to(configProvider_1.default).inSingletonScope();
            container.bind(symbols_1.Symbols.ShareChargeProvider).to(shareChargeProvider_1.default).inSingletonScope();
            container.bind(symbols_1.Symbols.LoggingProvider).to(loggingProvider_1.default).inSingletonScope();
            container.bind(symbols_1.Symbols.BridgeProvider).to(bridgeProvider_1.default).inSingletonScope();
            container.bind(symbols_1.Symbols.WalletProvider).to(walletProvider_1.default).inSingletonScope();
            CoreClient_1.container = container;
        }
        return CoreClient_1.container.resolve(CoreClient_1);
    }
    static rebind(symb, obj) {
        if (!CoreClient_1.container) {
            CoreClient_1.getInstance();
        }
        CoreClient_1.container.rebind(symb).to(obj).inSingletonScope();
    }
};
CoreClient = CoreClient_1 = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(symbols_1.Symbols.ConfigProvider)),
    __param(1, inversify_1.inject(symbols_1.Symbols.BridgeProvider)),
    __param(2, inversify_1.inject(symbols_1.Symbols.ShareChargeProvider)),
    __param(3, inversify_1.inject(symbols_1.Symbols.WalletProvider)),
    __param(4, inversify_1.inject(symbols_1.Symbols.LoggingProvider)),
    __metadata("design:paramtypes", [configProvider_1.default,
        bridgeProvider_1.default,
        shareChargeProvider_1.default,
        walletProvider_1.default,
        loggingProvider_1.default])
], CoreClient);
exports.CoreClient = CoreClient;
//# sourceMappingURL=coreClient.js.map