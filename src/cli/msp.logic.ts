import { ShareCharge } from "@motionwerk/sharecharge-lib";
import LogicBase from "./logicBase"

export default class MspLogic extends LogicBase {

    sc: ShareCharge;
    tokenAddress: string;

    constructor() {
        super();
        this.tokenAddress = this.client.config.tokenAddress;
        this.sc = ShareCharge.getInstance({ tokenAddress: this.tokenAddress });
    }

    public deploy = async (argv) => {

        if (this.tokenAddress) {
            this.client.logger.info("You have already provisioned an MSP Token Contract");
            return;
        }

        const name = argv.name.join(' ');
        const symbol = argv.symbol;

        const result = await this.sc.token.useWallet(this.client.wallet).deploy(name, symbol);

        this.client.logger.info(`New contract created at address ${result}.`);
        this.client.logger.info(`Save this address in your config under "tokenAddress" to use it`);
    }

    public setAccess = async (argv) => {
        if (!this.tokenAddress) {
            this.client.logger.info("No token address specified in config");
            return;
        }
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
        if (!this.tokenAddress) {
            this.client.logger.info("No token address specified in config");
            return;
        }

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
        if (!this.tokenAddress) {
            this.client.logger.info("No token address specified in config");
            return;
        }
        const driver = argv.driver;
        const balance = await this.sc.token.balance(driver);
         this.client.logger.info(`Balance: ${balance}`);
    }
    
    public info = async () => {
        if (!this.tokenAddress) {
            this.client.logger.info("No token address specified in config");
            return;
        }
        const name = await this.sc.token.contract.call("name");
        this.client.logger.info(`Name:    ${name}`);
        const symbol = await this.sc.token.contract.call("symbol");
        this.client.logger.info(`Symbol:  ${symbol}`);
        this.client.logger.info(`Address: ${this.tokenAddress}`);
        const owner = await this.sc.token.owner();
        this.client.logger.info(`Owner:   ${owner}`);
    }

    private isOwner = async () => {
        const owner = await this.sc.token.owner();
        return owner.toLowerCase() === this.client.wallet.keychain[0].address;
    }
} 