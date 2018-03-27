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
import ConnectorsProvider from "./services/connectorsProvider";

@injectable()
export default class ShareChargeCoreClient {

    private static container: Container;

    constructor(@inject(Symbols.ConfigProvider) private configProvider: ConfigProvider,
                @inject(Symbols.BridgeProvider) private bridgeProvider: BridgeProvider,
                @inject(Symbols.ShareChargeProvider) private shareChargeProvider: ShareChargeProvider,
                @inject(Symbols.WalletProvider) private walletProvider: WalletProvider,
                @inject(Symbols.ConnectorsProvider) private connectorsProvider: ConnectorsProvider,
                @inject(Symbols.LoggingProvider) private loggingProvider: LoggingProvider) {
    }

    get sc(): ShareCharge {
        return this.shareChargeProvider.obtain();
    }

    get connectors(): any[] {
        return this.connectorsProvider.obtain();
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

    static getInstance(): ShareChargeCoreClient {

        if (!ShareChargeCoreClient.container) {
            const container = new Container();
            container.bind<ConfigProvider>(Symbols.ConfigProvider).to(ConfigProvider).inSingletonScope();
            container.bind<ShareChargeProvider>(Symbols.ShareChargeProvider).to(ShareChargeProvider).inSingletonScope();
            container.bind<LoggingProvider>(Symbols.LoggingProvider).to(LoggingProvider).inSingletonScope();
            container.bind<BridgeProvider>(Symbols.BridgeProvider).to(BridgeProvider).inSingletonScope();
            container.bind<ConnectorsProvider>(Symbols.ConnectorsProvider).to(ConnectorsProvider).inSingletonScope();
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