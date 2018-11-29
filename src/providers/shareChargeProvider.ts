import { ShareCharge } from "@shareandcharge/sharecharge-lib"
import { IConfig } from "@shareandcharge/sharecharge-common"

export default class ShareChargeProvider {

    public obtain(config: IConfig): ShareCharge {
        return ShareCharge.getInstance(config);
    }

}