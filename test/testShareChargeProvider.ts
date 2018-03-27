import { injectable, inject } from "inversify";
import ShareChargeProvider from "../src/services/shareChargeProvider";
import { Evse, Wallet, ToolKit } from "sharecharge-lib";

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
            useWallet: (wallet: Wallet, keyIndex: number = 0) => {
                return TestShareChargeProvider.connectorModifiers
            },
            getById: (id) => {
                return TestShareChargeProvider.blockchain[id] || Evse.deserialize({id});
            }
        },
        charging: {
            useWallet: (wallet) => {
                return TestShareChargeProvider.chargingModifiers
            }
        },
        on: () => {

        },
        startListening: () => {

        }
    };

    obtain(): any {

        return TestShareChargeProvider.scMock;
    }
}