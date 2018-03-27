import { injectable, inject } from "inversify";
import ConfigProvider from "../src/services/configProvider";
import ShareChargeProvider from "../src/services/shareChargeProvider";
import { Evse, ShareCharge } from "../../sharecharge-lib/dist/src";

@injectable()
export default class TestShareChargeProvider extends ShareChargeProvider {

    public static blockchain: object = {};

    public static connectorModifiers = {
        create: (connector) => {

            TestShareChargeProvider.blockchain[connector.id] = connector;
        },
        update: (connector) => {

            TestShareChargeProvider.blockchain[connector.id] = connector;
        }
    };

    public static chargingModifiers = {
        requestStart: (connector, seconds) => {

            TestShareChargeProvider.blockchain[connector.id] = connector;
        },
        requestStop: (connector) => {

            TestShareChargeProvider.blockchain[connector.id] = connector;
        }
    };

    public static scMock = {
        evses: {
            useWallet: (wallet) => {
                return TestShareChargeProvider.connectorModifiers
            },
            getById: (id) => {
                return TestShareChargeProvider.blockchain[id] || Evse.deserialize({id, owner: id});
            },
            isPersisted: (connector: Evse) => !!TestShareChargeProvider.blockchain[connector.id]
        },
        charging: {
            useWallet: (wallet) => {
                return TestShareChargeProvider.chargingModifiers
            }
        }
    };

    obtain(): any {

        return TestShareChargeProvider.scMock;
    }
}