import { injectable, inject } from "inversify";
import ConfigProvider from "../services/configProvider";
import { Symbols } from "../symbols";
import { Wallet } from "@motionwerk/sharecharge-lib";

@injectable()
export default class WalletProvider {

    constructor(@inject(Symbols.ConfigProvider) private configProvider: ConfigProvider) {
    }

    public obtain(): Wallet {
        return new Wallet(this.configProvider.seed)
    }
}