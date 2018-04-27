import * as mocha from 'mocha';
import { expect } from 'chai';
import * as sinon from "sinon";

import StationLogic from "../../src/cli/cpo/station.logic";
import ShareChargeCoreClient from "../../src/shareChargeCoreClient";
import { Symbols } from "../../src/symbols";

import TestConfigProvider from "../testConfigProvider";
import TestLoggingProvider from "../testLoggingProvider";
import TestShareChargeProvider from "../testShareChargeProvider";
import TestBridgeProvider from "../testBridgeProvider";

import StationProvider from "../../src/services/stationProvider";
import { ToolKit } from "@motionwerk/sharecharge-lib";

describe("StationLogic", () => {

    let stationLogic: StationLogic;

    before(() => {
        stationLogic = new StationLogic();
        ShareChargeCoreClient.rebind(Symbols.LoggingProvider, TestLoggingProvider);
        ShareChargeCoreClient.rebind(Symbols.ShareChargeProvider, TestShareChargeProvider);
        ShareChargeCoreClient.rebind(Symbols.BridgeProvider, TestBridgeProvider);
        ShareChargeCoreClient.rebind(Symbols.ConfigProvider, TestConfigProvider);
        ShareChargeCoreClient.rebind(Symbols.StationProvider, StationProvider);
    });

    beforeEach(() => {
        TestShareChargeProvider.blockchain.stations = {};
    });

    describe("#register()", () => {

        it("should register a station correctly", async () => {

            const idToTest = "one";

            const createSpy = sinon.spy(TestShareChargeProvider.stationModifiers, "create");
            const result = await stationLogic.register({id: idToTest, json: false});
            createSpy.restore();

            expect(createSpy.calledOnce).to.be.true;

            expect(ToolKit.hexToString(result.id)).to.equal(idToTest);
            expect(result.latitude).to.equal(stationLogic.client.stations[idToTest].latitude);
            expect(result.longitude).to.equal(stationLogic.client.stations[idToTest].longitude);
        });
    });

    describe("#registerAll()", () => {

        it("should register all stations correctly", async () => {

            const createSpy = sinon.spy(TestShareChargeProvider.stationBatchModifiers, "create");
            const results = await stationLogic.registerAll({json: false});
            createSpy.restore();

            const stationIndexes = Object.keys(stationLogic.client.stations);

            expect(createSpy.calledOnce).to.be.true;
            expect(results.length).to.be.equal(stationIndexes.length);
            expect(results[0].id).to.be.equal(stationIndexes[0]);
            expect(results[0].latitude).to.be.equal(stationLogic.client.stations[stationIndexes[0]].latitude);
            expect(results[0].longitude).to.be.equal(stationLogic.client.stations[stationIndexes[0]].longitude);
        });
    });

});
