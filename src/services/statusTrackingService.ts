import CoreService from "./coreService";
import { IResult } from "@motionwerk/sharecharge-common";

export default class StatusTrackingService {

    constructor(private coreService: CoreService) {
    }

    // not implemented yet!
    private startStatusUpdater(interval = 60000) {
        setInterval(async () => {
            const locations = await this.coreService.sc.store.getLocationsByCPO(this.coreService.wallet.coinbase);
            for (const location of locations) {
                try {
                    // console.log(`Requesting status update for ${location.scId}`);
                    // const result: IResult = await this.coreService.bridge.getStatus(location);
                    // if (result.data.location) {
                    //     console.log(`Received new status update for ${location.scId}`);
                    //     await this.coreService.sc.store.useWallet(this.coreService.wallet).updateLocation(location.scId, result.data.location);
                    //     console.log(`Updated ${location.scId} status on network`);
                    // }
                } catch (err) {
                    console.log(`Error updating ${location.scId} status: ${err.message}`);
                }
            }
        }, interval);
    }

}