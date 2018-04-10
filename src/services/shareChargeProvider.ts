import { injectable, inject } from "inversify";
import { ShareCharge } from "@motionwerk/sharecharge-lib"

@injectable()
export default class ShareChargeProvider {

    public obtain(): ShareCharge {
        return ShareCharge.getInstance();
    }
}