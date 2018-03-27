import * as mocha from 'mocha';
import { expect } from 'chai';
import * as sinon from "sinon";

import { Evse, ToolKit } from "sharecharge-lib";

import ConnectorLogic from "../../src/cli/connector.logic";
import ShareChargeCoreClient from "../../src/shareChargeCoreClient";
import { Symbols } from "../../src/symbols";

import TestConfigProvider from "../testConfigProvider";
import TestLoggingProvider from "../testLoggingProvider";
import TestShareChargeProvider from "../testShareChargeProvider";
import TestBridgeProvider from "../testBridgeProvider";
import ConnectorsProvider from "../../src/services/connectorsProvider";

describe("ConnectorLogic", () => {

    let connectorLogic: ConnectorLogic;

    before(() => {
        connectorLogic = new ConnectorLogic();
        ShareChargeCoreClient.rebind(Symbols.LoggingProvider, TestLoggingProvider);
        ShareChargeCoreClient.rebind(Symbols.ShareChargeProvider, TestShareChargeProvider);
        ShareChargeCoreClient.rebind(Symbols.BridgeProvider, TestBridgeProvider);
        ShareChargeCoreClient.rebind(Symbols.ConfigProvider, TestConfigProvider);
        ShareChargeCoreClient.rebind(Symbols.ConnectorsProvider, ConnectorsProvider);
    });

    describe("#register()", () => {

        it("should register a connector correctly", async () => {

            const idToTest = "0x1000000001";

            const doRegisterSpy = sinon.spy(connectorLogic, "doRegister");

            const result = await connectorLogic.register({id: idToTest, json: false});

            expect(doRegisterSpy.calledOnce).to.be.true;
            doRegisterSpy.restore();

            expect(result.id).to.include(idToTest);
            expect(result.available).to.equal(true);
            expect(ToolKit.toPlugMask(result.plugTypes)).to.equal(72);
        });
    });

    describe("#registerAll()", () => {

        it("should register all connectors correctly", async () => {

            const doRegisterSpy = sinon.spy(connectorLogic, "doRegister");

            const results = await connectorLogic.registerAll({json: false});

            const connectorIndexes = Object.keys(connectorLogic.client.connectors);

            expect(doRegisterSpy.callCount).to.be.equal(connectorIndexes.length);
            expect(results.length).to.be.equal(doRegisterSpy.callCount);
            expect(results.length).to.be.equal(connectorIndexes.length);

            doRegisterSpy.restore();

            expect(results[0].available).to.be.equal(connectorLogic.client.connectors[connectorIndexes[0]].available);
        });
    });

    describe("#info()", () => {

        it("output info about the connector correctly", async () => {

            const evse = new Evse();
            evse.plugTypes = ToolKit.fromPlugMask(16);
            evse.available = false;

            TestShareChargeProvider.blockchain[evse.id] = evse;
            TestShareChargeProvider.blockchain[evse.id]._owner = ToolKit.randomBytes32String();

            const result = await connectorLogic.info({id: evse.id, json: false});

            expect(result.id).to.equal(evse.id);
            expect(result.plugTypes[0]).to.equal(evse.plugTypes[0]);
            expect(result.available).to.equal(evse.available);
        });

        it("fails if the connector is not persisted", async () => {

            const idToTest = ToolKit.randomBytes32String();

            const result = await connectorLogic.info({id: idToTest, json: false});

            expect(result).to.equal(null);
        });
    });

    describe("#infoAll()", () => {

    });

    describe("#status()", () => {

        it("should return true if connector and bridge are available", async () => {

            const connector = Evse.deserialize({owner: ToolKit.randomBytes32String()});
            connector.available = true;
            connector.stationId = ToolKit.randomBytes32String();

            TestShareChargeProvider.blockchain[connector.id] = connector;
            TestBridgeProvider.backend[connector.id] = {
                available: true
            };

            const result = await connectorLogic.status({id: connector.id, json: false});

            expect(result.state.bridge).to.be.equal(true);
            expect(result.state.ev).to.be.equal(true);
        });

        it("should return false if connector is not registered", async () => {

            const connector = new Evse();
            connector.available = false;
            connector.stationId = ToolKit.randomBytes32String();

            const result = await connectorLogic.status({id: connector.id, json: false});

            expect(result.state.bridge).to.be.equal(false);
            expect(result.state.ev).to.be.equal(false);
        });

        it("should return false if connector is unavailable", async () => {

            const connector = Evse.deserialize({owner: ToolKit.randomBytes32String()});
            connector.available = false;
            connector.stationId = ToolKit.randomBytes32String();

            TestShareChargeProvider.blockchain[connector.id] = connector;
            TestBridgeProvider.backend[connector.id] = {
                available: true
            };

            const result = await connectorLogic.status({id: connector.id, json: false});

            expect(result.state.bridge).to.be.equal(true);
            expect(result.state.ev).to.be.equal(false);
        });

        it("should return false if bridge is unavailable in CPO backend", async () => {

            const connector = Evse.deserialize({owner: ToolKit.randomBytes32String()});
            connector.available = true;
            connector.stationId = ToolKit.randomBytes32String();

            TestShareChargeProvider.blockchain[connector.id] = connector;
            TestBridgeProvider.backend[connector.id] = {
                available: false
            };

            const result = await connectorLogic.status({id: connector.id, json: false});

            expect(result.state.bridge).to.be.equal(false);
            expect(result.state.ev).to.be.equal(true);
        });

    });

    describe("#enable()", () => {

        it("should enable a disabled connector", async () => {

            const connector = Evse.deserialize({owner: ToolKit.randomBytes32String()});
            connector.available = false;

            TestShareChargeProvider.blockchain[connector.id] = connector;
            TestShareChargeProvider.blockchain[connector.id]._owner = ToolKit.randomBytes32String();

            const getByIdSpy = sinon.spy(TestShareChargeProvider.scMock.evses, "getById");
            const updateSpy = sinon.spy(TestShareChargeProvider.connectorModifiers, "update");

            const result = await connectorLogic.enable({id: connector.id, json: false});
            getByIdSpy.restore();
            updateSpy.restore();

            expect(TestShareChargeProvider.blockchain[connector.id].available).to.be.true;
            expect(result.success).to.be.true;
            expect(getByIdSpy.calledOnce).to.be.true;
            expect(updateSpy.calledOnce).to.be.true;
        });

        it("should return error if already enabled", async () => {

            const connector = Evse.deserialize({owner: ToolKit.randomBytes32String()});
            connector.available = true;

            TestShareChargeProvider.blockchain[connector.id] = connector;

            const getByIdSpy = sinon.spy(TestShareChargeProvider.scMock.evses, "getById");
            const updateSpy = sinon.spy(TestShareChargeProvider.connectorModifiers, "update");

            const result = await connectorLogic.enable({id: connector.id, json: false});
            getByIdSpy.restore();
            updateSpy.restore();

            expect(TestShareChargeProvider.blockchain[connector.id].available).to.be.true;
            expect(result.success).to.be.false;
            expect(getByIdSpy.calledOnce).to.be.true;
            expect(updateSpy.notCalled).to.be.true;
        });
    });

    describe("#disable()", () => {

        it("should disable an enabled connector", async () => {

            const connector = Evse.deserialize({owner: ToolKit.randomBytes32String()})
            connector.available = true;

            TestShareChargeProvider.blockchain[connector.id] = connector;

            const getByIdSpy = sinon.spy(TestShareChargeProvider.scMock.evses, "getById");
            const updateSpy = sinon.spy(TestShareChargeProvider.connectorModifiers, "update");

            const result = await connectorLogic.disable({id: connector.id, json: false});
            updateSpy.restore();
            getByIdSpy.restore();

            expect(TestShareChargeProvider.blockchain[connector.id].available).to.be.false;
            expect(result.success).to.be.true;
            expect(getByIdSpy.calledOnce).to.be.true;
            expect(updateSpy.calledOnce).to.be.true;
        });

        it("should return error of already disabled", async () => {

            const connector = Evse.deserialize({owner: ToolKit.randomBytes32String()});
            connector.available = false;

            TestShareChargeProvider.blockchain[connector.id] = connector;

            const getByIdSpy = sinon.spy(TestShareChargeProvider.scMock.evses, "getById");
            const updateSpy = sinon.spy(TestShareChargeProvider.connectorModifiers, "update");

            const result = await connectorLogic.disable({id: connector.id, json: false});

            getByIdSpy.restore();
            updateSpy.restore();

            expect(TestShareChargeProvider.blockchain[connector.id].available).to.be.false;
            expect(result.success).to.be.false;
            expect(getByIdSpy.calledOnce).to.be.true;
            expect(updateSpy.notCalled).to.be.true;
        });
    });

    describe("#start()", () => {

        it("should start charging on available connector", async () => {

            const connector = Evse.deserialize({owner: ToolKit.randomBytes32String()});
            connector.available = true;

            TestShareChargeProvider.blockchain[connector.id] = connector;

            const requestStartSpy = sinon.spy(TestShareChargeProvider.chargingModifiers, "requestStart");
            const getByIdSpy = sinon.spy(TestShareChargeProvider.scMock.evses, "getById");

            const result = await connectorLogic.start({id: connector.id, seconds: 100, json: false});

            requestStartSpy.restore();
            getByIdSpy.restore();

            expect(result.success).to.be.true;
            expect(result.id).to.be.equal(connector.id);
            expect(requestStartSpy.calledOnce).to.be.true;
            expect(getByIdSpy.calledOnce).to.be.true;
        });

        it("should not start charging on unavailable connector", async () => {

            const connector = Evse.deserialize({owner: ToolKit.randomBytes32String()});
            connector.available = false;

            TestShareChargeProvider.blockchain[connector.id] = connector;

            const requestStartSpy = sinon.spy(TestShareChargeProvider.chargingModifiers, "requestStart");
            const getByIdSpy = sinon.spy(TestShareChargeProvider.scMock.evses, "getById");

            const result = await connectorLogic.start({id: connector.id, seconds: 100, json: false});

            requestStartSpy.restore();
            getByIdSpy.restore();

            expect(result.success).to.be.false;
            expect(result.id).to.be.equal(connector.id);
            expect(requestStartSpy.notCalled).to.be.true;
            expect(getByIdSpy.calledOnce).to.be.true;
        });

    });

    describe("#stop()", () => {

        it("should stop charging on a currently charging connector", async () => {

            const connector = Evse.deserialize({owner: ToolKit.randomBytes32String()});
            connector.available = false;
            TestShareChargeProvider.blockchain[connector.id] = connector;

            const requestStopSpy = sinon.spy(TestShareChargeProvider.chargingModifiers, "requestStop");
            const getByIdSpy = sinon.spy(TestShareChargeProvider.scMock.evses, "getById");

            const result = await connectorLogic.stop({id: connector.id, seconds: 100, json: false});
            requestStopSpy.restore();
            getByIdSpy.restore();

            expect(result.success).to.be.true;
            expect(result.id).to.be.equal(connector.id);
            expect(requestStopSpy.calledOnce).to.be.true;
            expect(getByIdSpy.calledOnce).to.be.true;
        });

        it("should return an error if connector is not charging", async () => {

            const connector = new Evse();
            connector.available = true;
            TestShareChargeProvider.blockchain[connector.id] = connector;

            const getByIdSpy = sinon.spy(TestShareChargeProvider.scMock.evses, "getById");

            const result = await connectorLogic.stop({id: connector.id, seconds: 100, json: false});
            getByIdSpy.restore();

            expect(result.success).to.be.false;
            expect(result.id).to.be.equal(connector.id);
            expect(getByIdSpy.calledOnce).to.be.true;
        });

        it("should return an error on an unregistered connector", async () => {

            const connector = new Evse();

            const getByIdSpy = sinon.spy(TestShareChargeProvider.scMock.evses, "getById");
            const result = await connectorLogic.stop({id: connector.id, seconds: 100, json: false});
            getByIdSpy.restore();

            expect(result.success).to.be.false;
            expect(getByIdSpy.calledOnce).to.be.true;
        });

    });

});
