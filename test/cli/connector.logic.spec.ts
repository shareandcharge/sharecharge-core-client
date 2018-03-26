import * as mocha from 'mocha';
import { expect } from 'chai';
import * as sinon from "sinon";

import ConnectorLogic from "../../src/cli/connector.logic";
import { Evse, ToolKit } from "sharecharge-lib";
import { loadConfigFromFile } from "../../src/utils/config";
import IClientConfig from "../../src/models/iClientConfig";
import IBridge from "../../src/models/iBridge";

describe("ConnectorLogic", () => {

    let config: IClientConfig, scMock: any, blockchain: object, cpoBackend: object,
        connectorLogic: ConnectorLogic, connectorModifiers, chargingModifiers;

    before(() => {

        config = loadConfigFromFile("./test/config.yaml");

        config.logger = {
            info: () => {
            },
            warn: () => {
            }
        };

        config.bridge = <IBridge>{
            connectorStatus: (id: string) => {
                return cpoBackend[id].available;
            }
        };

        connectorModifiers = {
            create: (connector) => {

                blockchain[connector.id] = connector;
            },
            update: (connector) => {

                blockchain[connector.id] = connector;
            }
        };

        chargingModifiers = {
            requestStart: (connector, seconds) => {

                blockchain[connector.id] = connector;
            },
            requestStop: (connector) => {

                blockchain[connector.id] = connector;
            }
        };

        scMock = {
            evses: {
                useWallet: (wallet) => {
                    return connectorModifiers
                },
                getById: (id) => {
                    return blockchain[id] || Evse.deserialize({id, owner: config.id});
                },
                isPersisted: (connector: Evse) => !!blockchain[connector.id]
            },
            charging: {
                useWallet: (wallet) => {
                    return chargingModifiers
                }
            }
        };

        connectorLogic = new ConnectorLogic(config, scMock);
    });

    beforeEach(() => {
        blockchain = {};
        cpoBackend = {};
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
            expect(result.owner).to.include(config.id);
        });
    });

    describe("#registerAll()", () => {

        it("should register all connectors correctly", async () => {

            const doRegisterSpy = sinon.spy(connectorLogic, "doRegister");

            const results = await connectorLogic.registerAll({json: false});

            const connectorIndexes = Object.keys(config.connectors);

            expect(doRegisterSpy.callCount).to.be.equal(connectorIndexes.length);
            expect(results.length).to.be.equal(doRegisterSpy.callCount);
            expect(results.length).to.be.equal(connectorIndexes.length);

            doRegisterSpy.restore();

            expect(results[0].available).to.be.equal(config.connectors[connectorIndexes[0]].available);
            expect(results[0].owner).to.be.equal(config.id);
        });
    });

    describe("#info()", () => {

        it("output info about the connector correclty", async () => {

            const connector = Evse.deserialize({id: ToolKit.randomBytes32String(), owner: config.id});
            connector.plugTypes = ToolKit.fromPlugMask(16);
            connector.available = false;

            blockchain[connector.id] = connector;

            const result = await connectorLogic.info({id: connector.id, json: false});

            expect(result.id).to.equal(connector.id);
            expect(result.owner).to.equal(config.id);
            expect(result.plugTypes[0]).to.equal(connector.plugTypes[0]);
            expect(result.available).to.equal(connector.available);
        });

        it("fails if the connector is not persisted", async () => {

            const idToTest = ToolKit.randomBytes32String();

            const isPersistedSpy = sinon.spy(scMock.evses, "isPersisted");

            const result = await connectorLogic.info({id: idToTest, json: false});
            isPersistedSpy.restore();

            expect(result).to.equal(null);

            expect(isPersistedSpy.calledOnce).to.be.true;
        });
    });

    describe("#infoAll()", () => {

    });

    describe("#status()", () => {

        it("should return true if connector and bridge are available", async () => {

            const connector = new Evse();
            connector.available = true;
            connector.stationId = ToolKit.randomBytes32String();

            blockchain[connector.id] = connector;
            cpoBackend[connector.id] = {
                available: true
            };

            const result = await connectorLogic.status({id: connector.id, json: false});

            expect(result.state.bridge).to.be.equal(true);
            expect(result.state.ev).to.be.equal(true);
        });

        it("should return false if connector is unavailable", async () => {

            const connector = new Evse();
            connector.available = false;
            connector.stationId = ToolKit.randomBytes32String();

            blockchain[connector.id] = connector;
            cpoBackend[connector.id] = {
                available: true
            };

            const result = await connectorLogic.status({id: connector.id, json: false});

            expect(result.state.bridge).to.be.equal(true);
            expect(result.state.ev).to.be.equal(false);
        });

        it("should return false if bridge is unavailable", async () => {

            const connector = new Evse();
            connector.available = true;
            connector.stationId = ToolKit.randomBytes32String();

            blockchain[connector.id] = connector;
            cpoBackend[connector.id] = {
                available: false
            };

            const result = await connectorLogic.status({id: connector.id, json: false});

            expect(result.state.bridge).to.be.equal(false);
            expect(result.state.ev).to.be.equal(true);
        });

    });

    describe("#enable()", () => {

        it("should enable a disabled connector", async () => {

            const connector = new Evse();
            connector.available = false;

            blockchain[connector.id] = connector;

            const getByIdSpy = sinon.spy(scMock.evses, "getById");
            const updateSpy = sinon.spy(connectorModifiers, "update");

            const result = await connectorLogic.enable({id: connector.id, json: false});
            getByIdSpy.restore();
            updateSpy.restore();

            expect(blockchain[connector.id].available).to.be.true;
            expect(result.success).to.be.true;
            expect(getByIdSpy.calledOnce).to.be.true;
            expect(updateSpy.calledOnce).to.be.true;
        });

        it("should return error if already enabled", async () => {

            const connector = new Evse();
            connector.available = true;

            blockchain[connector.id] = connector;

            const getByIdSpy = sinon.spy(scMock.evses, "getById");
            const updateSpy = sinon.spy(connectorModifiers, "update");

            const result = await connectorLogic.enable({id: connector.id, json: false});
            getByIdSpy.restore();
            updateSpy.restore();

            expect(blockchain[connector.id].available).to.be.true;
            expect(result.success).to.be.false;
            expect(getByIdSpy.calledOnce).to.be.true;
            expect(updateSpy.notCalled).to.be.true;
        });
    });

    describe("#disable()", () => {

        it("should disable an enabled connector", async () => {

            const connector = new Evse();
            connector.available = true;

            blockchain[connector.id] = connector;

            const getByIdSpy = sinon.spy(scMock.evses, "getById");
            const updateSpy = sinon.spy(connectorModifiers, "update");

            const result = await connectorLogic.disable({id: connector.id, json: false});
            updateSpy.restore();
            getByIdSpy.restore();

            expect(blockchain[connector.id].available).to.be.false;
            expect(result.success).to.be.true;
            expect(getByIdSpy.calledOnce).to.be.true;
            expect(updateSpy.calledOnce).to.be.true;
        });

        it("should return error of already disabled", async () => {

            const connector = new Evse();
            connector.available = false;

            blockchain[connector.id] = connector;

            const getByIdSpy = sinon.spy(scMock.evses, "getById");
            const updateSpy = sinon.spy(connectorModifiers, "update");

            const result = await connectorLogic.disable({id: connector.id, json: false});

            getByIdSpy.restore();
            updateSpy.restore();

            expect(blockchain[connector.id].available).to.be.false;
            expect(result.success).to.be.false;
            expect(getByIdSpy.calledOnce).to.be.true;
            expect(updateSpy.notCalled).to.be.true;
        });
    });

    describe("#start()", () => {

        it("should start charging on available connector", async () => {

            const connector = new Evse();
            connector.available = true;
            blockchain[connector.id] = connector;

            const requestStartSpy = sinon.spy(chargingModifiers, "requestStart");
            const getByIdSpy = sinon.spy(scMock.evses, "getById");

            const result = await connectorLogic.start({id: connector.id, seconds: 100, json: false});

            requestStartSpy.restore();
            getByIdSpy.restore();

            expect(result.success).to.be.true;
            expect(result.id).to.be.equal(connector.id);
            expect(requestStartSpy.calledOnce).to.be.true;
            expect(getByIdSpy.calledOnce).to.be.true;
        });

        it("should not start charging on unavailable connector", async () => {

            const connector = new Evse();
            connector.available = false;
            blockchain[connector.id] = connector;

            const requestStartSpy = sinon.spy(chargingModifiers, "requestStart");
            const getByIdSpy = sinon.spy(scMock.evses, "getById");

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

            const connector = new Evse();
            connector.available = false;
            blockchain[connector.id] = connector;

            const requestStopSpy = sinon.spy(chargingModifiers, "requestStop");
            const getByIdSpy = sinon.spy(scMock.evses, "getById");

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
            blockchain[connector.id] = connector;

            const getByIdSpy = sinon.spy(scMock.evses, "getById");

            const result = await connectorLogic.stop({id: connector.id, seconds: 100, json: false});
            getByIdSpy.restore();

            expect(result.success).to.be.false;
            expect(result.id).to.be.equal(connector.id);
            expect(getByIdSpy.calledOnce).to.be.true;
        });

        it("should return an error on an unregistered connector", async () => {

            const connector = new Evse();

            const getByIdSpy = sinon.spy(scMock.evses, "getById");
            const result = await connectorLogic.stop({id: connector.id, seconds: 100, json: false});
            getByIdSpy.restore();

            expect(result.success).to.be.false;
            expect(getByIdSpy.calledOnce).to.be.true;
        });

    });

});
