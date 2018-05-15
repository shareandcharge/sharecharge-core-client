import { injectable, inject } from "inversify";
import { ShareCharge } from "@motionwerk/sharecharge-lib"
import IClientConfig from "../interfaces/iClientConfig";

@injectable()
export default class ShareChargeProvider {

    public obtain(config: IClientConfig): ShareCharge {
        return ShareCharge.getInstance(config);
    }
}