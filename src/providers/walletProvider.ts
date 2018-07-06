import { Wallet } from "@motionwerk/sharecharge-lib";
import ConfigProvider from "./configProvider";

export default class WalletProvider {

    constructor(private configProvider: ConfigProvider) {
    }

    public obtain(): Wallet {
        return new Wallet(this.configProvider.seed)
    }

}