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

    get evses(): any {
        return this.stationProvider.getEvses();
    }

    get stations(): any {
        return this.stationProvider.getStations();
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

        // console.log(this.evses);
        const evseUids = Object.keys(this.evses);

        this.sc.on("StartRequested", async (result) => {
            const id = result.evseId;
            const evse = await this.sc.evses.getById(id);
            this.logger.debug(`Start requested for evse with uid: ${evse.uid}`);

            if (evseUids.includes(evse.uid)) {
                try {
                    await this.bridge.start(result);
                    await this.sc.charging.useWallet(this.wallet).confirmStart(evse);
                    this.logger.info(`Confirmed start for evse with uid: ${evse.uid}`);
                } catch (err) {
                    this.logger.error(`Error starting charge on ${evse.uid}: ${err.message}`);
                    await this.sc.charging.useWallet(this.wallet).error(evse, 0);
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
                    await this.sc.charging.useWallet(this.wallet).confirmStop(evse);
                    this.logger.info(`Confirmed stop for evse with uid: ${evse.uid}`);
                } catch (err) {
                    this.logger.error(`Error stopping charge on ${evse.uid}: ${err.message}`);
                    await this.sc.charging.useWallet(this.wallet).error(evse, 1);
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
            const evse = await this.sc.evses.getById(result.evseId);
            const cdr = await this.bridge.cdr();
            await this.sc.charging.useWallet(this.wallet).confirmStop(evse);
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