import { Evse, ToolKit, Wallet } from "@motionwerk/sharecharge-lib";
import LogicBase from "../logicBase"

export default class ChargingLogic extends LogicBase {

    // public sessions = async (argv) => {

    //     const results: any[] = [];

    //     if (!argv.json) {
    //         this.client.logger.info("Getting all sessions on all evses");
    //     }

    //     const evseUids = Object.keys(this.client.evses);

    //     for (let evseUid of evseUids) {

    //         const evse: Evse = await this.client.sc.evses.getByUid(evseUid);

    //         if (!evse.owner.startsWith("0x00")) {

    //             const session = await this.client.sc.evses.getSession(evse);

    //             if (!session.controller.startsWith("0x00")) {
    //                 results.push({
    //                     evse: evse.uid,
    //                     controller: session.controller
    //                 });
    //             }
    //         }
    //     }

    //     if (!argv.json) {

    //         if (results.length === 0) {
    //             this.client.logger.info("No sessions running")
    //         }

    //         for (const result of results) {
    //             this.client.logger.info(result.evse, result.controller)
    //         }

    //     } else {
    //         console.log(JSON.stringify(results, null, 2))
    //     }

    //     return results;
    // };

    public requestStart = async (argv) => {
        const token = argv.token || this.client.sc.token.address;
        console.log('charging as', this.client.wallet.keychain[0].address);
        // console.log('params', argv.scId, argv.evseId, token, argv.amount);

        await this.client.sc.charging.useWallet(this.client.wallet).requestStart(argv.scId, argv.evseId, token, argv.amount);
        console.log('Successfully requested start');
    }

    public confirmStart = async (argv) => {
        await this.client.sc.charging.useWallet(this.client.wallet).confirmStart(argv.scId, argv.evseId, argv.sessionId);
        console.log('Successfully confirmed start');
    }

    public requestStop = async (argv) => {
        await this.client.sc.charging.useWallet(this.client.wallet).requestStop(argv.scId, argv.evseId);
        console.log('Succesfully requested stop');
    }

    public confirmStop = async (argv) => {
        await this.client.sc.charging.useWallet(this.client.wallet).confirmStop(argv.scId, argv.evseId);
        console.log('Successfully confirmed stop');
    }

    public chargeDetailRecord = async (argv) => {
        await this.client.sc.charging.useWallet(this.client.wallet).chargeDetailRecord(argv.scId, argv.evseId, argv.finalPrice);
        console.log('Successfully called charge detail record');
    }

}
