import { ShareCharge, Wallet } from "sharecharge-lib";
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
import EvseProvider from "./services/evseProvider";

@injectable()
export default class ShareChargeCoreClient {

    private static container: Container;

    constructor(@inject(Symbols.ConfigProvider) private configProvider: ConfigProvider,
                @inject(Symbols.BridgeProvider) private bridgeProvider: BridgeProvider,
                @inject(Symbols.ShareChargeProvider) private shareChargeProvider: ShareChargeProvider,
                @inject(Symbols.WalletProvider) private walletProvider: WalletProvider,
                @inject(Symbols.EvseProvider) private evseProvider: EvseProvider,
                @inject(Symbols.LoggingProvider) private loggingProvider: LoggingProvider) {
    }

    get sc(): ShareCharge {
        return this.shareChargeProvider.obtain();
    }

    get evses(): any[] {
        return this.evseProvider.obtain();
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

    private static shortenId(id) {
        return id.replace(/0+$/g, "").toLowerCase()
    }

    public run() {

        // console.log(this.evses);
        const evseUids = Object.values(this.evses).map(evse => evse.uid);
        
        this.sc.on("StartRequested", async (result) => {
            const id = result.evseId;
            const evse = await this.sc.evses.getById(id);
            this.logger.debug(`Start requested for evse with uid: ${evse.uid}`);
            
            if (evseUids.includes(evse.uid)) {
                try {
                    await this.bridge.start(result);
                    await this.sc.charging.useWallet(this.wallet).confirmStart(evse, result.controller);
                    this.logger.info(`Confirmed start for evse with uid: ${evse.uid}`);
                } catch (err) {
                    this.logger.error("Err");
                    await this.sc.charging.useWallet(this.wallet).error(evse, result.controller, 0);
                }
            }
        });
        
        this.sc.on("StopRequested", async (result) => {
            const id = result.evseId;
            const evse = await this.sc.evses.getById(id);
            this.logger.debug(`Stop requested for evse with uid: ${evse.uid}`);
                
            if (evseUids.includes(evse.uid)) {
                try {
                    await this.bridge.stop(result);
                    const cdr = await this.bridge.cdr(result);
                    await this.sc.charging.useWallet(this.wallet).confirmStop(evse, result.controller, cdr.start, cdr.stop, cdr.energy);
                    this.logger.info(`Confirmed stop for evse with uid: ${evse.uid}`);
                } catch (err) {
                    this.logger.error("Err");
                    await this.sc.charging.useWallet(this.wallet).error(evse, result.controller, 1);
                }    
            }
        });

        this.bridge.autoStop$.subscribe(async (result) => {
            const evse = await this.sc.evses.getById(result.evseId);
            const cdr = await this.bridge.cdr();            
            await this.sc.charging.useWallet(this.wallet).confirmStop(evse, result.controller, cdr.start, cdr.stop, cdr.energy);
            this.logger.info(`Confirmed stop for evse with uid: ${evse.uid}`);
        });
        
        this.sc.startListening();
        this.logger.info(`Connected to bridge: ${this.bridge.name}`);
        this.logger.info(`Listening for events`);
    }

    static getInstance(): ShareChargeCoreClient {

        if (!ShareChargeCoreClient.container) {
            const container = new Container();
            container.bind<ConfigProvider>(Symbols.ConfigProvider).to(ConfigProvider).inSingletonScope();
            container.bind<ShareChargeProvider>(Symbols.ShareChargeProvider).to(ShareChargeProvider).inSingletonScope();
            container.bind<LoggingProvider>(Symbols.LoggingProvider).to(LoggingProvider).inSingletonScope();
            container.bind<BridgeProvider>(Symbols.BridgeProvider).to(BridgeProvider).inSingletonScope();
            container.bind<EvseProvider>(Symbols.EvseProvider).to(EvseProvider).inSingletonScope();
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