import ShareChargeCoreClient from "../shareChargeCoreClient";

export default class LogicBase {

    get client() {
        return ShareChargeCoreClient.getInstance()
    }
}