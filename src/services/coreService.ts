import { ShareCharge, Wallet } from "@motionwerk/sharecharge-lib/dist";
import { IConfig, IBridge, IResult, ISession, IStopParameters, ICDR, getConfigDir } from "@motionwerk/sharecharge-common/dist/common";
import ConfigProvider from "../providers/configProvider";
import ShareChargeProvider from "../providers/shareChargeProvider";
import BridgeProvider from "../providers/bridgeProvider";
import WalletProvider from "../providers/walletProvider";

export default class CoreService {

    constructor(private configProvider: ConfigProvider,
                private bridgeProvider: BridgeProvider,
                private shareChargeProvider: ShareChargeProvider,
                private walletProvider: WalletProvider) {
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

    get config(): IConfig {
        return this.configProvider;
    }

    async getIds(): Promise<string[]> {
        return this.sc.store.getIdsByCPO(this.wallet.coinbase);
    }

}