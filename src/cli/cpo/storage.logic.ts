import { ShareCharge } from "@motionwerk/sharecharge-lib";
import LogicBase from "../logicBase"

export default class StorageLogic extends LogicBase {

    constructor() {
        super();
    }

    public addLocation = async (argv) => {
        const path = '../../../' + argv.file;
        const locations = require(path)
        for (const location of locations) {
            const result = await this.client.sc.store.useWallet(this.client.wallet).addLocation(location);
            console.log(result);
        }
    }

    public getLocation = async (argv) => {
        const cpo = argv.cpo || this.client.wallet.keychain[0].address;
        if (argv.id) {
            const locations = await this.client.sc.store.getLocationById(cpo, argv.id);
            console.log(locations);
        } else {
            const location = await this.client.sc.store.getLocationsByCPO(cpo);
            console.log(location);
        }
    }

    public addTariffs = async (argv) => {
        const path = '../../../' + argv.file;
        const tariffs = require(path);
        const result = await this.client.sc.store.useWallet(this.client.wallet).addTariffs(tariffs);
        console.log(`Added tariff data\nIPFS: ${result}`);
    }

    public getTariffs = async (argv) => {
        const cpo = argv.cpo || this.client.wallet.keychain[0].address;
        const result = await this.client.sc.store.getTariffsByCPO(cpo);
        console.log(JSON.stringify(result));
    }

}