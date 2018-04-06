import { injectable, inject } from "inversify";
import ShareChargeProvider from "../src/services/shareChargeProvider";
import { Evse, Wallet, ToolKit } from "sharecharge-lib";

@injectable()
export default class TestShareChargeProvider extends ShareChargeProvider {

    public static blockchain: object = {};
    public static readonly owner = "0x123456789";

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
                    id: id,
                    owner: TestShareChargeProvider.owner
                });
            },
            getByUid: (uid) => {

                let result: Evse = new Evse();

                for (let key of Object.keys(TestShareChargeProvider.blockchain)) {

                    const e = TestShareChargeProvider.blockchain[key];

                    if (e.uid === uid) {
                        result = e;

                        break;
                    }
                }

                return result;
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