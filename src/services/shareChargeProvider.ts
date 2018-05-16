import { injectable, inject } from "inversify";
import { ShareCharge } from "@motionwerk/sharecharge-lib"
import { IConfig } from "@motionwerk/sharecharge-common"

@injectable()
export default class ShareChargeProvider {

    public obtain(config: IConfig): ShareCharge {
        return ShareCharge.getInstance(config);
    }
}