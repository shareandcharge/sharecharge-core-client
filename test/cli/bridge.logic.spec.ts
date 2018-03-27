import * as mocha from 'mocha';
import { expect } from 'chai';

import BridgeLogic from "../../src/cli/bridge.logic";
import ShareChargeCoreClient from "../../src/shareChargeCoreClient";
import { Symbols } from "../../src/symbols";

import TestConfigProvider from "../testConfigProvider";
import TestLoggingProvider from "../testLoggingProvider";
import TestShareChargeProvider from "../testShareChargeProvider";
import TestBridgeProvider from "../testBridgeProvider";

describe('BridgeLogic', () => {

    let bridgeLogic: BridgeLogic;

    beforeEach(() => {
        bridgeLogic = new BridgeLogic();
        ShareChargeCoreClient.rebind(Symbols.LoggingProvider, TestLoggingProvider);
        ShareChargeCoreClient.rebind(Symbols.BridgeProvider, TestBridgeProvider);
        ShareChargeCoreClient.rebind(Symbols.ShareChargeProvider, TestShareChargeProvider);
        ShareChargeCoreClient.rebind(Symbols.ConfigProvider, TestConfigProvider);
    });

    describe("#status()", () => {

        it('should return the configured bridge correctly', async () => {

            const result = await bridgeLogic.status({});
            expect(result.name).to.equal("test1");
        });

        it('should return available in normal cases', async () => {

            const result = await bridgeLogic.status({});
            expect(result.bridge.isAvailable).to.equal(true);
        });

        it('should return not available if it is not available', async () => {

            TestBridgeProvider.healthy = false;
            const result = await bridgeLogic.status({});
            expect(result.bridge.isAvailable).to.equal(false);
        });
    });
});
