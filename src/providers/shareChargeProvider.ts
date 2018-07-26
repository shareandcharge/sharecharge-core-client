import { ShareCharge } from "@motionwerk/sharecharge-lib/dist"
import { IConfig } from "@motionwerk/sharecharge-common/dist/common"

export default class ShareChargeProvider {

    public obtain(config: IConfig): ShareCharge {
        return ShareCharge.getInstance(config);
    }

}