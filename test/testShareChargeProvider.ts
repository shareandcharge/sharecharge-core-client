import { injectable, inject } from "inversify";
import ShareChargeProvider from "../src/services/shareChargeProvider";
import { Evse, Wallet, ToolKit } from "sharecharge-lib";

@injectable()
export default class TestShareChargeProvider extends ShareChargeProvider {

    public static blockchain: object = {};

    public static evseModifiers = {
        create: (evse) => {

            TestShareChargeProvider.blockchain[evse.id] = evse;
        },
        update: (evse) => {

            TestShareChargeProvider.blockchain[evse.id] = evse;
        }
    };

    public static chargingModifiers = {
        requestStart: (evse, seconds) => {

            TestShareChargeProvider.blockchain[evse.id] = evse;
        },
        requestStop: (evse) => {

            TestShareChargeProvider.blockchain[evse.id] = evse;
        }
    };

    public static scMock = {
        evses: {
            useWallet: (wallet: Wallet, keyIndex: number = 0) => {
                return TestShareChargeProvider.evseModifiers
            },
            getById: (id) => {
                return TestShareChargeProvider.blockchain[id] || Evse.deserialize({
                    id,
                    owner: '0x0',
                    currency: '0x455552'
                });
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