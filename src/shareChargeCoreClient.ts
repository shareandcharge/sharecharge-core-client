import { ShareCharge, Wallet } from "@motionwerk/sharecharge-lib";
import "reflect-metadata";
import LoggingProvider from "./services/loggingProvider";
import IBridge from "./models/iBridge";
import { Symbols } from "./symbols"
import { Container, injectable, inject } from "inversify";
import ConfigProvider from "./services/configProvider";
import ShareChargeProvider from "./services/shareChargeProvider";
import BridgeProvider from "./services/bridgeProvider";
import WalletProvider from "./services/walletProvider";
import IClientConfig from "./models/iClientConfig";
import StationProvider from "./services/stationProvider";

@injectable()
export default class ShareChargeCoreClient {

    private static container: Container;

    constructor(@inject(Symbols.ConfigProvider) private configProvider: ConfigProvider,
                @inject(Symbols.BridgeProvider) private bridgeProvider: BridgeProvider,
                @inject(Symbols.ShareChargeProvider) private shareChargeProvider: ShareChargeProvider,
                @inject(Symbols.WalletProvider) private walletProvider: WalletProvider,
                @inject(Symbols.StationProvider) private stationProvider: StationProvider,
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

    get config(): IClientConfig {
        return this.configProvider;
    }

    public run() {

        this.sc.store.getLocationsByCPO(this.wallet.keychain[0].address).then(locations => {
        
            const scIds = locations.map(loc => loc.scId);

            this.sc.on("StartRequested", async (result) => {
                const id = result.scId;
                this.logger.debug(`Start requested for evse with scId: ${id}`);
    
                if (scIds.includes(id)) {
                    try {
                        await this.bridge.start(result);
                        const sessionId = '0x01'; // hardcoded for now but should come from bridge
                        await this.sc.charging.useWallet(this.wallet).confirmStart(id, result.evseId, sessionId);
                        this.logger.info(`Confirmed start for evse with scId: ${id}`);
                    } catch (err) {
                        this.logger.error(`Error starting charge on ${id}: ${err.message}`);
                        await this.sc.charging.useWallet(this.wallet).error(id, result.evseId, 0);
                    }
                }
            });
    
            this.sc.on("StopRequested", async (result) => {
                const id = result.scId;
                this.logger.debug(`Stop requested for evse with uid: ${id}`);
    
                if (scIds.includes(id)) {
                    try {
                        await this.bridge.stop(result);
                        const cdr = await this.bridge.cdr(result);
                        await this.sc.charging.useWallet(this.wallet).confirmStop(id, result.evseId);
                        this.logger.info(`Confirmed stop for evse with scId: ${id}`);
                    } catch (err) {
                        this.logger.error(`Error stopping charge on ${id}: ${err.message}`);
                        await this.sc.charging.useWallet(this.wallet).error(id, result.evseId, 1);
                    }
                }
            });
    
            this.sc.on("StationCreated", async (result) => {
                this.logger.debug(`Station created with id: ${result.stationId}`);
            });
    
            this.sc.on("StationUpdated", async (result) => {
                this.logger.debug(`Station updated with id: ${result.stationId}`);
            });
    
            this.sc.on("EvseCreated", async (result) => {
                this.logger.debug(`Evse created with id: ${result.evseId}`);
            });
    
            this.sc.on("EvseUpdated", async (result) => {
                this.logger.debug(`Evse updated with id: ${result.evseId}`);
            });
    
            this.bridge.autoStop$.subscribe(async (result) => {
                const cdr = await this.bridge.cdr();
                await this.sc.charging.useWallet(this.wallet).confirmStop(result.scId, result.evseId);
                this.logger.info(`Confirmed stop for evse with scId: ${result.scId}`);
            });
    
            this.sc.startListening();
            this.logger.info(`Connected to bridge: ${this.bridge.name}`);
            this.logger.info(`Listening for events`);
        
        });
    }


    static getInstance(): ShareChargeCoreClient {

        if (!ShareChargeCoreClient.container) {
            const container = new Container();
            container.bind<ConfigProvider>(Symbols.ConfigProvider).to(ConfigProvider).inSingletonScope();
            container.bind<ShareChargeProvider>(Symbols.ShareChargeProvider).to(ShareChargeProvider).inSingletonScope();
            container.bind<LoggingProvider>(Symbols.LoggingProvider).to(LoggingProvider).inSingletonScope();
            container.bind<BridgeProvider>(Symbols.BridgeProvider).to(BridgeProvider).inSingletonScope();
            container.bind<StationProvider>(Symbols.StationProvider).to(StationProvider).inSingletonScope();
            container.bind<WalletProvider>(Symbols.WalletProvider).to(WalletProvider).inSingletonScope();
            ShareChargeCoreClient.container = container;
        }

        return ShareChargeCoreClient.container.resolve(ShareChargeCoreClient);
    }

    static rebind(symb, obj) {

        if (!ShareChargeCoreClient.container) {
            ShareChargeCoreClient.getInstance();
        }

        ShareChargeCoreClient.container.rebind(symb).to(obj).inSingletonScope();
    }
}