import { ShareCharge } from "@motionwerk/sharecharge-lib";
import LogicBase from "../logicBase"

export default class TokenLogic extends LogicBase {

    sc: ShareCharge;

    constructor() {
        super();
        this.sc = ShareCharge.getInstance({ tokenAddress: this.client.config.tokenAddress });
    }

    public deploy = async (argv) => {

        const name = argv.name.join(' ');
        const symbol = argv.symbol;

        const result = await this.sc.token.useWallet(this.client.wallet).deploy(name, symbol);

        this.client.logger.info(`New contract created at address ${result}.`);
        this.client.logger.info(`Save this address in your config under "tokenAddress" to use it`);
    }

    public setAccess = async (argv) => {
        const owner = await this.isOwner();
        if (!owner) {
            this.client.logger.info("You do not have the right to set access on this contract");
            return;
        }
        const charging = argv.charging;
        await this.sc.token.useWallet(this.client.wallet).setAccess(charging);
        this.client.logger.info(`Granted Charging Contract at ${charging} access to your MSP Token`)
    }

    public mint = async (argv) => {
        const owner = await this.isOwner();
        if (!owner) {
            this.client.logger.info("You do not have the right to mint tokens for this contract");
            return;
        }
        const driver = argv.driver;
        const amount = argv.amount;

        await this.sc.token.useWallet(this.client.wallet).mint(driver, amount);
        this.client.logger.info("Funded driver");
        await this.balance({ driver });
    }
    
    public balance = async (argv) => {
        const driver = argv.driver;
        const balance = await this.sc.token.getBalance(driver);
         this.client.logger.info(`Balance: ${balance}`);
    }
    
    public info = async () => {
        const name = await this.sc.token.contract.call("name");
        this.client.logger.info(`Name:    ${name}`);
        const symbol = await this.sc.token.contract.call("symbol");
        this.client.logger.info(`Symbol:  ${symbol}`);
        this.client.logger.info(`Address: ${this.client.sc.token.address}`);
        const owner = await this.sc.token.getOwner();
        this.client.logger.info(`Owner:   ${owner}`);
    }

    private isOwner = async () => {
        const owner = await this.sc.token.getOwner();
        return owner.toLowerCase() === this.client.wallet.keychain[0].address;
    }
} 