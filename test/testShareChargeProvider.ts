import { injectable, inject } from "inversify";
import ShareChargeProvider from "../src/services/shareChargeProvider";
import { Evse, Wallet, Station, ToolKit } from "@motionwerk/sharecharge-lib";

@injectable()
export default class TestShareChargeProvider extends ShareChargeProvider {

    public static blockchain: any = {
        evses: {},
        stations: {}
    };

    public static readonly owner = "0x123456789";

    public static evseBatchModifiers = {
        create: (...evses) => {

            for (let evse of evses) {
                TestShareChargeProvider.blockchain.evses[evse.id] = evse;
            }
        }
    };

    public static evseModifiers = {
        create: (evse) => {

            TestShareChargeProvider.blockchain.evses[evse.id] = evse;
        },
        update: (evse) => {

            TestShareChargeProvider.blockchain.evses[evse.id] = evse;
        },
        batch: () => {
            return TestShareChargeProvider.evseBatchModifiers;
        }
    };

    public static stationBatchModifiers = {
        create: (...stations) => {

            for (let station of stations) {
                TestShareChargeProvider.blockchain.stations[station.id] = station;
            }
        }
    };

    public static stationModifiers = {
        create: (station) => {

            TestShareChargeProvider.blockchain.stations[station.id] = station;
        },
        update: (station) => {

            TestShareChargeProvider.blockchain.stations[station.id] = station;
        },
        batch: () => {
            return TestShareChargeProvider.stationBatchModifiers;
        }
    };

    public static chargingModifiers = {
        requestStart: (evse, seconds) => {

            TestShareChargeProvider.blockchain.evses[evse.id] = evse;
        },
        requestStop: (evse) => {

            TestShareChargeProvider.blockchain.evses[evse.id] = evse;
        },
        confirmStop: (evse) => {

            TestShareChargeProvider.blockchain.evses[evse.id] = evse;
        }
    };

    public static scMock = {
        evses: {
            useWallet: (wallet: Wallet, keyIndex: number = 0) => {
                return TestShareChargeProvider.evseModifiers
            },
            getById: (id) => {
                return TestShareChargeProvider.blockchain.evses[id] || Evse.deserialize({
                    id: id,
                    owner: TestShareChargeProvider.owner
                });
            },
            getByUid: (uid) => {

                let result: Evse = new Evse();

                for (let key of Object.keys(TestShareChargeProvider.blockchain.evses)) {

                    const e = TestShareChargeProvider.blockchain.evses[key];

                    if (e.uid === uid) {
                        result = e;

                        break;
                    }
                }

                return result;
            },
            getSession: (uid) => {

                return {
                    controller: ToolKit.randomBytes32String()
                }
            }
        },
        stations: {
            useWallet: (wallet: Wallet, keyIndex: number = 0) => {
                return TestShareChargeProvider.stationModifiers
            },
            getById: (id) => {
                return TestShareChargeProvider.blockchain.stations[id] || Station.deserialize({
                    id: id,
                    owner: "0x00",
                    openingHours: "0x00"
                });
            }
        },
        charging: {
            contract: { },
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