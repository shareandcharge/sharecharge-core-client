import { ShareCharge, Wallet } from "@motionwerk/sharecharge-lib";
import { IConfig, IBridge, IResult, IParameters, ICDR } from "@motionwerk/sharecharge-common";
import "reflect-metadata";
import { Container, injectable, inject } from "inversify";
import LoggingProvider from "./services/loggingProvider";
import { Symbols } from "./symbols"
import ConfigProvider from "./services/configProvider";
import ShareChargeProvider from "./services/shareChargeProvider";
import BridgeProvider from "./services/bridgeProvider";
import WalletProvider from "./services/walletProvider";

@injectable()
export class CoreClient {

    private static container: Container;

    constructor(@inject(Symbols.ConfigProvider) private configProvider: ConfigProvider,
                @inject(Symbols.BridgeProvider) private bridgeProvider: BridgeProvider,
                @inject(Symbols.ShareChargeProvider) private shareChargeProvider: ShareChargeProvider,
                @inject(Symbols.WalletProvider) private walletProvider: WalletProvider,
                @inject(Symbols.LoggingProvider) private loggingProvider: LoggingProvider) {
    }

    get sc(): ShareCharge {
        return this.shareChargeProvider.obtain(this.configProvider);
    }

    get bridge(): IBridge {
        return this.bridgeProvider.obtain();
    }
    
    get wallet(): Wallet {
        return this.walletProvider.obtain();
    }
    
    get logger() {
        return this.loggingProvider.obtain();
    }

    get config(): IConfig {
        return this.configProvider;
    }

    async getIds(): Promise<string[]> {
        return this.sc.store.getIdsByCPO(this.wallet.coinbase);
    }

    private async createCdrParameters(scId: string, evseId: string, sessionId: string): Promise<any> {

        // could be that the bridge has no way of knowing the base price so we get it here first
        // should return tariff object from which you can get price given certain parameters
        const tariff = await this.sc.store.getTariffByEvse(scId, evseId);
        console.log(tariff);
        const state = await this.sc.charging.getSession(scId, evseId);

        let price;
        
        switch (state.tariffId) {
            case '0':
                price = tariff.energyRates[0].priceComponents.price;
                break;
            case '1':
                price = tariff.flatRates[0].priceComponents.price;
                break;
            case '3':
                price = tariff.timeRates[0].priceComponents.price;
                break;
            default:
                price = 0;
        }

        const cdrParameters = {
            scId,
            evseId,
            sessionId,
            price,
        };

        console.log("CDR Parameters", JSON.stringify(cdrParameters, null, 2));

        return cdrParameters;
    }

    private run(idsOnStartup: string[]) {

        this.sc.on("StartRequested", async (startRequestedEvent) => {

            this.logger.info(`Start requested on ${startRequestedEvent.evseId}`);

            const scIds = await this.getIds();

            if (scIds.includes(startRequestedEvent.scId)) {

                try {

                    this.logger.info('Attempting to start');

                    // start the bridge side
                    const startResult: IResult = await this.bridge.start(<IParameters>{
                        scId: startRequestedEvent.scId,
                        evseId: startRequestedEvent.evseId,
                    });

                    // started in cpos backend
                    if (startResult.success) {

                        // register start in ev-network
                        await this.sc.charging.useWallet(this.wallet)
                            .confirmStart(startRequestedEvent.scId, startRequestedEvent.evseId, startResult.data.sessionId);

                        this.logger.info(`Confirmed ${startRequestedEvent.evseId} start`);
                    }

                } catch (err) {

                    this.logger.error(`Error starting ${startRequestedEvent.evseId}: ${err.message}`);

                    // reset the charger in the ev-network because we failed to start a charge
                    await this.sc.charging.useWallet(this.wallet)
                        .reset(startRequestedEvent.scId, startRequestedEvent.evseId);

                    this.logger.info(`Reset session of scId: ${startRequestedEvent.scId} evseId: ${startRequestedEvent.evseId}`);

                    // invoke error
                    await this.sc.charging.useWallet(this.wallet)
                        .error(startRequestedEvent.scId, startRequestedEvent.evseId, 0);
                }
            }

        });

        this.sc.on("StopRequested", async (stopRequestedEvent) => {

            this.logger.debug(`Stop requested for evse with uid: ${stopRequestedEvent.scId}`);

            const scIds = await this.getIds();

            if (scIds.includes(stopRequestedEvent.scId)) {

                try {

                    // stop the bride side
                    const stopResult: IResult = await this.bridge.stop(<IParameters>{
                        scId: stopRequestedEvent.scId,
                        evseId: stopRequestedEvent.evseId,
                        sessionId: stopRequestedEvent.sessionId
                    });

                    // stopped in the cpos backend
                    if (stopResult.success) {

                        // create cdr
                        const cdrParams = await this.createCdrParameters(stopRequestedEvent.scId, stopRequestedEvent.evseId, stopRequestedEvent.sessionId);
                        const cdr: ICDR = await this.bridge.cdr(cdrParams);

                        // confirm stop in ev-network
                        await this.sc.charging.useWallet(this.wallet)
                            .confirmStop(stopRequestedEvent.scId, stopRequestedEvent.evseId);
                        this.logger.info(`Confirmed ${stopRequestedEvent.evseId} stop`);

                        // settle in ev network
                        await this.sc.charging.useWallet(this.wallet)
                            .chargeDetailRecord(stopRequestedEvent.scId, stopRequestedEvent.evseId, cdr.chargedUnits, cdr.price);
                        this.logger.info(`Wrote ${stopRequestedEvent.evseId}'s CDR to the network`);
                    }

                } catch (err) {
                    this.logger.error(`Error stopping ${stopRequestedEvent.evseId}: ${err.message}`);
                    await this.sc.charging.useWallet(this.wallet).error(stopRequestedEvent.scId, stopRequestedEvent.evseId, 1);
                }
            }
        });

        this.bridge.autoStop$.subscribe(async (autoStopEvent) => {
            try {
                const cdrParams = await this.createCdrParameters(autoStopEvent.scId, autoStopEvent.evseId, autoStopEvent.sessionId);
                const cdr: ICDR = await this.bridge.cdr(cdrParams);

                await this.sc.charging.useWallet(this.wallet)
                    .confirmStop(autoStopEvent.scId, autoStopEvent.evseId);
                this.logger.info(`Confirmed ${autoStopEvent.evseId} autostop`);

                await this.sc.charging.useWallet(this.wallet)
                    .chargeDetailRecord(autoStopEvent.scId, autoStopEvent.evseId, cdr.chargedUnits, cdr.price);
                this.logger.info(`Wrote ${autoStopEvent.evseId}'s CDR to the network`);

            } catch (err) {
                this.logger.error(`Error confirming ${autoStopEvent.evseId} autostop: ${err.message}`);
                await this.sc.charging.useWallet(this.wallet).error(autoStopEvent.scId, autoStopEvent.evseId, 2);
            }
        });

        this.sc.startListening();
        this.logger.info(`Coinbase: ${this.wallet.coinbase}`);
        this.logger.info(`Connected to bridge: ${this.bridge.name}`);
        this.logger.info(`Listening for events`);
        this.logger.info(`Listening for these IDs:\n${idsOnStartup.join('\n')}`);
    }

    public main() {
        this.getIds().then(ids => this.run(ids));
    }

    static getInstance(): CoreClient {

        if (!CoreClient.container) {
            const container = new Container();
            container.bind<ConfigProvider>(Symbols.ConfigProvider).to(ConfigProvider).inSingletonScope();
            container.bind<ShareChargeProvider>(Symbols.ShareChargeProvider).to(ShareChargeProvider).inSingletonScope();
            container.bind<LoggingProvider>(Symbols.LoggingProvider).to(LoggingProvider).inSingletonScope();
            container.bind<BridgeProvider>(Symbols.BridgeProvider).to(BridgeProvider).inSingletonScope();
            container.bind<WalletProvider>(Symbols.WalletProvider).to(WalletProvider).inSingletonScope();
            CoreClient.container = container;
        }

        return CoreClient.container.resolve(CoreClient);
    }

    static rebind(symb, obj) {

        if (!CoreClient.container) {
            CoreClient.getInstance();
        }

        CoreClient.container.rebind(symb).to(obj).inSingletonScope();
    }
}