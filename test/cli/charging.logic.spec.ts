import * as mocha from 'mocha';
import { expect } from 'chai';

import ChargingLogic from "../../src/cli/charging.logic";
import ShareChargeCoreClient from "../../src/shareChargeCoreClient";
import StationProvider from "../../src/services/stationProvider";

import { Symbols } from "../../src/symbols";

import TestConfigProvider from "../testConfigProvider";
import TestLoggingProvider from "../testLoggingProvider";
import TestShareChargeProvider from "../testShareChargeProvider";
import TestBridgeProvider from "../testShareChargeProvider";

import { Evse, ToolKit } from "@motionwerk/sharecharge-lib";

describe('ChargingLogic', () => {

    let chargingLogic: ChargingLogic;

    before(() => {
        chargingLogic = new ChargingLogic();
        ShareChargeCoreClient.rebind(Symbols.LoggingProvider, TestLoggingProvider);
        ShareChargeCoreClient.rebind(Symbols.ShareChargeProvider, TestShareChargeProvider);
        ShareChargeCoreClient.rebind(Symbols.BridgeProvider, TestBridgeProvider);
        ShareChargeCoreClient.rebind(Symbols.ConfigProvider, TestConfigProvider);
        ShareChargeCoreClient.rebind(Symbols.StationProvider, StationProvider);
    });

    beforeEach(() => {
        TestShareChargeProvider.blockchain.evses = {};
    });

    describe("#sessions()", () => {

        it('should return 0 results if no sessions are running', async () => {

            const results = await chargingLogic.sessions({});
            expect(results.length).to.equal(0);
        });

        it('should return the currently running session', async () => {

            const uidToTest = "FR448E1ETG5578567YU8D";

            TestShareChargeProvider.blockchain.evses[uidToTest] = new Evse();
            TestShareChargeProvider.blockchain.evses[uidToTest].uid = uidToTest;
            TestShareChargeProvider.blockchain.evses[uidToTest].available = false;
            TestShareChargeProvider.blockchain.evses[uidToTest]._owner = ToolKit.randomBytes32String();

            const results = await chargingLogic.sessions({});
            expect(results.length).to.equal(1);
            expect(results[0].evse).to.equal(uidToTest);
        });
    });
});
