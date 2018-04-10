import * as mocha from 'mocha';
import { expect } from 'chai';
import * as sinon from "sinon";

import { Evse, ToolKit } from "@motionwerk/sharecharge-lib";
import EvseLogic from "../../src/cli/evse.logic";
import ShareChargeCoreClient from "../../src/shareChargeCoreClient";
import { Symbols } from "../../src/symbols";

import TestConfigProvider from "../testConfigProvider";
import TestLoggingProvider from "../testLoggingProvider";
import TestShareChargeProvider from "../testShareChargeProvider";
import TestBridgeProvider from "../testBridgeProvider";
import EvseProvider from "../../src/services/evseProvider";

describe("EvseLogic", () => {

    let evseLogic: EvseLogic;

    before(() => {
        evseLogic = new EvseLogic();
        ShareChargeCoreClient.rebind(Symbols.LoggingProvider, TestLoggingProvider);
        ShareChargeCoreClient.rebind(Symbols.ShareChargeProvider, TestShareChargeProvider);
        ShareChargeCoreClient.rebind(Symbols.BridgeProvider, TestBridgeProvider);
        ShareChargeCoreClient.rebind(Symbols.ConfigProvider, TestConfigProvider);
        ShareChargeCoreClient.rebind(Symbols.EvseProvider, EvseProvider);
    });

    beforeEach(() => {
        TestShareChargeProvider.blockchain.evses = {};
    });

    describe("#register()", () => {

        it("should register a evse correctly", async () => {

            const uidToTest = "FR448E1ETG5578567YU8D";

            const doRegisterSpy = sinon.spy(evseLogic, "doRegister");
            const createSpy = sinon.spy(TestShareChargeProvider.evseModifiers, "create");

            const result = await evseLogic.register({id: uidToTest, json: false});
            doRegisterSpy.restore();
            createSpy.restore();

            expect(doRegisterSpy.calledOnce).to.be.true;

            // expect(result.id).to.include(idToTest);
            expect(result.available).to.equal(true);
            expect(result.id).to.equal(uidToTest);
            expect(createSpy.calledOnce).to.be.true;
        });

        it("should not register a evse with the same id twice", async () => {

            const uidToTest = "FR448E1ETG5578567YU8D";

            TestShareChargeProvider.blockchain.evses[uidToTest] = new Evse();
            TestShareChargeProvider.blockchain.evses[uidToTest].uid = uidToTest;
            TestShareChargeProvider.blockchain.evses[uidToTest].available = true;
            TestShareChargeProvider.blockchain.evses[uidToTest]._owner = ToolKit.randomBytes32String();

            const doRegisterSpy = sinon.spy(evseLogic, "doRegister");
            const createSpy = sinon.spy(TestShareChargeProvider.evseModifiers, "create");

            const result = await evseLogic.register({id: uidToTest, json: false});
            doRegisterSpy.restore();
            createSpy.restore();

            expect(result.available).to.be.true;
            expect(result.id).to.equal(uidToTest);

            expect(doRegisterSpy.calledOnce).to.be.true;
            expect(createSpy.notCalled).to.be.true;
        });
    });

    describe("#registerAll()", () => {

        it("should register all evses correctly", async () => {

            const createSpy = sinon.spy(TestShareChargeProvider.evseBatchModifiers, "create");
            const results = await evseLogic.registerAll({json: false});
            createSpy.restore();

            const evseIndexes = Object.keys(evseLogic.client.evses);

            expect(createSpy.calledOnce).to.be.true;
            expect(results.length).to.be.equal(evseIndexes.length);
            expect(results[0].available).to.be.equal(evseLogic.client.evses[evseIndexes[0]].available);
            expect(results[0].id).to.be.equal(evseIndexes[0]);
        });
    });

    describe("#info()", () => {

        it("output info about the evse correctly", async () => {

            const evse = new Evse();
            evse.available = false;

            TestShareChargeProvider.blockchain.evses[evse.id] = evse;
            TestShareChargeProvider.blockchain.evses[evse.id]._owner = ToolKit.randomBytes32String();

            const result = await evseLogic.info({id: evse.uid, json: false});

            expect(result.id).to.equal(evse.uid);
            expect(result.available).to.equal(evse.available);
        });

        // it("fails if the evse is not persisted", async () => {

        //     const idToTest = ToolKit.randomBytes32String();

        //     const result = await evseLogic.info({id: idToTest, json: false});

        //     expect(result).to.equal(null);
        // });
    });

    describe("#infoAll()", () => {

    });

    describe("#status()", () => {

        it("should return true if evse and bridge are available", async () => {

            const evse = Evse.deserialize({
                uid: '0x0', owner: ToolKit.randomBytes32String(), currency: '0x455552'
            });
            evse.available = true;
            evse.stationId = ToolKit.randomBytes32String();

            TestShareChargeProvider.blockchain.evses[evse.id] = evse;
            TestBridgeProvider.backend[evse.uid] = {
                available: true
            };

            const result = await evseLogic.status({id: evse.uid, json: false});

            expect(result.state.bridge).to.be.equal(true);
            expect(result.state.ev).to.be.equal(true);
        });

        // it("should return false if evse is not registered", async () => {

        //     const evse = new Evse();
        //     evse.available = false;
        //     evse.stationId = ToolKit.randomBytes32String();

        //     const result = await evseLogic.status({id: evse.id, json: false});

        //     expect(result.state.bridge).to.be.equal(false);
        //     expect(result.state.ev).to.be.equal(false);
        // });

        it("should return false if evse is unavailable", async () => {

            const evse = Evse.deserialize({
                uid: '0x0', owner: ToolKit.randomBytes32String(), currency: '0x455552'
            });
            evse.available = false;
            evse.stationId = ToolKit.randomBytes32String();

            TestShareChargeProvider.blockchain.evses[evse.id] = evse;
            TestBridgeProvider.backend[evse.uid] = {
                available: true
            };

            const result = await evseLogic.status({id: evse.uid, json: false});

            expect(result.state.bridge).to.be.equal(true);
            expect(result.state.ev).to.be.equal(false);
        });

        it("should return false if bridge is unavailable in CPO backend", async () => {

            const evse = Evse.deserialize({
                uid: '0x0', owner: ToolKit.randomBytes32String(), currency: '0x455552'
            });

            evse.available = true;
            evse.stationId = ToolKit.randomBytes32String();

            TestShareChargeProvider.blockchain.evses[evse.id] = evse;
            TestBridgeProvider.backend[evse.uid] = {
                available: false
            };

            const result = await evseLogic.status({id: evse.uid, json: false});

            expect(result.state.bridge).to.be.equal(false);
            expect(result.state.ev).to.be.equal(true);
        });

    });

    describe("#enable()", () => {

        it("should enable a disabled evse", async () => {

            const evse = Evse.deserialize({
                uid: '0x0', owner: ToolKit.randomBytes32String(), currency: '0x455552'
            });
            evse.available = false;

            TestShareChargeProvider.blockchain.evses[evse.id] = evse;

            const getByUidSpy = sinon.spy(TestShareChargeProvider.scMock.evses, "getByUid");
            const updateSpy = sinon.spy(TestShareChargeProvider.evseModifiers, "update");

            const result = await evseLogic.enable({id: evse.uid, json: false});

            getByUidSpy.restore();
            updateSpy.restore();

            expect(TestShareChargeProvider.blockchain.evses[evse.id].available).to.be.true;
            expect(result.success).to.be.true;
            expect(getByUidSpy.calledOnce).to.be.true;
            expect(updateSpy.calledOnce).to.be.true;
        });

        it("should return error if already enabled", async () => {

            const evse = Evse.deserialize({
                uid: '0x0',
                owner: ToolKit.randomBytes32String(), currency: '0x455552'
            });

            evse.available = true;

            TestShareChargeProvider.blockchain.evses[evse.id] = evse;

            const getByUidSpy = sinon.spy(TestShareChargeProvider.scMock.evses, "getByUid");
            const updateSpy = sinon.spy(TestShareChargeProvider.evseModifiers, "update");

            const result = await evseLogic.enable({id: evse.uid, json: false});
            getByUidSpy.restore();
            updateSpy.restore();

            expect(TestShareChargeProvider.blockchain.evses[evse.id].available).to.be.true;
            expect(result.success).to.be.false;
            expect(getByUidSpy.calledOnce).to.be.true;
            expect(updateSpy.notCalled).to.be.true;
        });
    });

    describe("#disable()", () => {

        it("should disable an enabled evse", async () => {

            const evse = Evse.deserialize({
                uid: '0x0', owner: ToolKit.randomBytes32String(), currency: '0x455552'
            });
            evse.available = true;

            TestShareChargeProvider.blockchain.evses[evse.id] = evse;

            const getByUidSpy = sinon.spy(TestShareChargeProvider.scMock.evses, "getByUid");
            const updateSpy = sinon.spy(TestShareChargeProvider.evseModifiers, "update");

            const result = await evseLogic.disable({id: evse.uid, json: false});

            updateSpy.restore();
            getByUidSpy.restore();

            expect(TestShareChargeProvider.blockchain.evses[evse.id].available).to.be.false;
            expect(result.success).to.be.true;
            expect(getByUidSpy.calledOnce).to.be.true;
            expect(updateSpy.calledOnce).to.be.true;
        });

        it("should return error of already disabled", async () => {

            const evse = Evse.deserialize({
                uid: '0x0', owner: ToolKit.randomBytes32String(), currency: '0x455552'
            });
            evse.available = false;

            TestShareChargeProvider.blockchain.evses[evse.id] = evse;

            const getByUidSpy = sinon.spy(TestShareChargeProvider.scMock.evses, "getByUid");
            const updateSpy = sinon.spy(TestShareChargeProvider.evseModifiers, "update");

            const result = await evseLogic.disable({id: evse.uid, json: false});

            getByUidSpy.restore();
            updateSpy.restore();

            expect(TestShareChargeProvider.blockchain.evses[evse.id].available).to.be.false;
            expect(result.success).to.be.false;
            expect(getByUidSpy.calledOnce).to.be.true;
            expect(updateSpy.notCalled).to.be.true;
        });
    });

    describe("#start()", () => {

        // it("should start charging on available evse", async () => {

        //     const evse = Evse.deserialize({owner: ToolKit.randomBytes32String(), currency: '0x455552' });
        //     evse.available = true;

        //     TestShareChargeProvider.blockchain.evses[evse.id] = evse;

        //     const requestStartSpy = sinon.spy(TestShareChargeProvider.chargingModifiers, "requestStart");
        //     const getByIdSpy = sinon.spy(TestShareChargeProvider.scMock.evses, "getById");

        //     const result = await evseLogic.start({id: evse.id, seconds: 100, json: false});

        //     requestStartSpy.restore();
        //     getByIdSpy.restore();

        //     expect(result.success).to.be.true;
        //     expect(result.id).to.be.equal(evse.id);
        //     expect(requestStartSpy.calledOnce).to.be.true;
        //     expect(getByIdSpy.calledOnce).to.be.true;
        // });

        it("should not start charging on unavailable evse", async () => {

            const evse = Evse.deserialize({
                uid: '0x0', owner: ToolKit.randomBytes32String(), currency: '0x455552'
            });
            evse.available = false;

            TestShareChargeProvider.blockchain.evses[evse.id] = evse;

            const requestStartSpy = sinon.spy(TestShareChargeProvider.chargingModifiers, "requestStart");
            const getByUidSpy = sinon.spy(TestShareChargeProvider.scMock.evses, "getByUid");

            const result = await evseLogic.start({id: evse.uid, seconds: 100, json: false});

            requestStartSpy.restore();
            getByUidSpy.restore();

            expect(result.success).to.be.false;
            expect(result.id).to.be.equal(evse.uid);
            expect(requestStartSpy.notCalled).to.be.true;
            expect(getByUidSpy.calledOnce).to.be.true;
        });

    });

    describe("#stop()", () => {

        it("should stop charging on a currently charging evse", async () => {

            const evse = Evse.deserialize({
                uid: '0x0', owner: ToolKit.randomBytes32String(), currency: '0x455552'
            });
            evse.available = false;
            TestShareChargeProvider.blockchain.evses[evse.id] = evse;

            const requestStopSpy = sinon.spy(TestShareChargeProvider.chargingModifiers, "requestStop");
            const getByUidSpy = sinon.spy(TestShareChargeProvider.scMock.evses, "getByUid");

            const result = await evseLogic.stop({id: evse.uid, seconds: 100, json: false});
            requestStopSpy.restore();
            getByUidSpy.restore();

            expect(result.success).to.be.true;
            expect(result.id).to.be.equal(evse.uid);
            expect(requestStopSpy.calledOnce).to.be.true;
            expect(getByUidSpy.calledOnce).to.be.true;
        });

        it("should return an error if evse is not charging", async () => {

            const evse = new Evse();
            evse.available = true;
            TestShareChargeProvider.blockchain.evses[evse.id] = evse;

            const getByUidSpy = sinon.spy(TestShareChargeProvider.scMock.evses, "getByUid");

            const result = await evseLogic.stop({id: evse.uid, seconds: 100, json: false});
            getByUidSpy.restore();

            expect(result.success).to.be.false;
            expect(result.id).to.be.equal(evse.uid);
            expect(getByUidSpy.calledOnce).to.be.true;
        });

        // it("should return an error on an unregistered evse", async () => {

        //     const evse = new Evse();

        //     const getByIdSpy = sinon.spy(TestShareChargeProvider.scMock.evses, "getById");
        //     const result = await evseLogic.stop({id: evse.id, seconds: 100, json: false});
        //     getByIdSpy.restore();

        //     expect(result.success).to.be.false;
        //     expect(getByIdSpy.calledOnce).to.be.true;
        // });

    });

});
