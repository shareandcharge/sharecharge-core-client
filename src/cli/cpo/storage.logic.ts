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
            this.client.logger.info(result);
        }

    }

}