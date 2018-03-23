import * as mocha from 'mocha';
import { expect } from 'chai';
import * as sinon from "sinon";

import ConnectorLogic from "../../src/cli/connector.logic";
import { Connector, ToolKit } from "sharecharge-lib";
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
            confirmStart: (connector) => {

                blockchain[connector.id] = connector;
            },
            confirmStop: (connector) => {

                blockchain[connector.id] = connector;
            }
        };

        scMock = {
            connectors: {
                useWallet: (wallet) => {
                    return connectorModifiers
                },
                getById: (id) => {
                    return blockchain[id] || Connector.deserialize({id, owner: config.id});
                },
                isPersisted: (connector: Connector) => !!blockchain[connector.id]
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

            const connector = new Connector();
            connector.owner = ToolKit.randomBytes32String();
            connector.plugTypes = ToolKit.fromPlugMask(16);
            connector.available = false;

            blockchain[connector.id] = connector;

            const result = await connectorLogic.info({id: connector.id, json: false});

            expect(result.id).to.equal(connector.id);
            expect(result.owner).to.equal(connector.owner);
            expect(result.plugTypes[0]).to.equal(connector.plugTypes[0]);
            expect(result.available).to.equal(connector.available);
        });

        it("fails if the connector is not persisted", async () => {

            const idToTest = ToolKit.randomBytes32String();

            const isPersistedSpy = sinon.spy(scMock.connectors, "isPersisted");

            const result = await connectorLogic.info({id: idToTest, json: false});

            expect(result).to.equal(null);

            expect(isPersistedSpy.calledOnce).to.be.true;
            isPersistedSpy.restore();
        });
    });

    describe("#infoAll()", () => {

    });

    describe("#status()", () => {

        it("should return true if connector and bridge are available", async () => {

            const connector = new Connector();
            connector.available = true;
            connector.owner = ToolKit.randomBytes32String();
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

            const connector = new Connector();
            connector.available = false;
            connector.owner = ToolKit.randomBytes32String();
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

            const connector = new Connector();
            connector.available = true;
            connector.owner = ToolKit.randomBytes32String();
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

            const connector = new Connector();
            connector.available = false;

            blockchain[connector.id] = connector;

            const getByIdSpy = sinon.spy(scMock.connectors, "getById");
            const updateSpy = sinon.spy(connectorModifiers, "update");

            const result = await connectorLogic.enable({id: connector.id, json: false});

            expect(blockchain[connector.id].available).to.be.true;
            expect(result.success).to.be.true;

            expect(getByIdSpy.calledOnce).to.be.true;
            getByIdSpy.restore();

            expect(updateSpy.calledOnce).to.be.true;
            updateSpy.restore();
        });

        it("should return error if already enabled", async () => {

            const connector = new Connector();
            connector.available = true;

            blockchain[connector.id] = connector;

            const getByIdSpy = sinon.spy(scMock.connectors, "getById");
            const updateSpy = sinon.spy(connectorModifiers, "update");

            const result = await connectorLogic.enable({id: connector.id, json: false});

            expect(blockchain[connector.id].available).to.be.true;
            expect(result.success).to.be.false;

            expect(getByIdSpy.calledOnce).to.be.true;
            getByIdSpy.restore();

            expect(updateSpy.notCalled).to.be.true;
            updateSpy.restore();
        });
    });

    describe("#disable()", () => {

        it("should disable an enabled connector", async () => {

            const connector = new Connector();
            connector.available = true;

            blockchain[connector.id] = connector;

            const getByIdSpy = sinon.spy(scMock.connectors, "getById");
            const updateSpy = sinon.spy(connectorModifiers, "update");

            const result = await connectorLogic.disable({id: connector.id, json: false});

            expect(blockchain[connector.id].available).to.be.false;
            expect(result.success).to.be.true;

            expect(getByIdSpy.calledOnce).to.be.true;
            getByIdSpy.restore();

            expect(updateSpy.calledOnce).to.be.true;
            updateSpy.restore();
        });

        it("should return error of already disabled", async () => {

            const connector = new Connector();
            connector.available = false;

            blockchain[connector.id] = connector;

            const getByIdSpy = sinon.spy(scMock.connectors, "getById");
            const updateSpy = sinon.spy(connectorModifiers, "update");

            const result = await connectorLogic.disable({id: connector.id, json: false});

            expect(blockchain[connector.id].available).to.be.false;
            expect(result.success).to.be.false;

            expect(getByIdSpy.calledOnce).to.be.true;
            getByIdSpy.restore();

            expect(updateSpy.notCalled).to.be.true;
            updateSpy.restore();
        });
    });

    describe("#start()", () => {

        it("should start charging on available connector", async () => {

            const connector = new Connector();
            connector.available = true;
            blockchain[connector.id] = connector;

            const confirmStartSpy = sinon.spy(chargingModifiers, "confirmStart");
            const requestStartSpy = sinon.spy(chargingModifiers, "requestStart");
            const getByIdSpy = sinon.spy(scMock.connectors, "getById");

            const result = await connectorLogic.start({id: connector.id, seconds: 100, json: false});

            expect(result.success).to.be.true;
            expect(result.id).to.be.equal(connector.id);

            expect(confirmStartSpy.calledOnce).to.be.true;
            confirmStartSpy.restore();

            expect(requestStartSpy.calledOnce).to.be.true;
            requestStartSpy.restore();

            expect(getByIdSpy.calledOnce).to.be.true;
            getByIdSpy.restore();
        });

        it("should not start charging on unavailable connector", async () => {

            const connector = new Connector();
            connector.available = false;
            blockchain[connector.id] = connector;

            const confirmStartSpy = sinon.spy(chargingModifiers, "confirmStart");
            const requestStartSpy = sinon.spy(chargingModifiers, "requestStart");
            const getByIdSpy = sinon.spy(scMock.connectors, "getById");

            const result = await connectorLogic.start({id: connector.id, seconds: 100, json: false});

            expect(result.success).to.be.false;
            expect(result.id).to.be.equal(connector.id);

            expect(confirmStartSpy.notCalled).to.be.true;
            confirmStartSpy.restore();

            expect(requestStartSpy.notCalled).to.be.true;
            requestStartSpy.restore();

            expect(getByIdSpy.calledOnce).to.be.true;
            getByIdSpy.restore();
        });

    });

    describe("#stop()", () => {

        it("should stop charging on a currently charging connector", async () => {

            const connector = new Connector();
            connector.available = false;
            blockchain[connector.id] = connector;

            const confirmStopSpy = sinon.spy(chargingModifiers, "confirmStop");
            const getByIdSpy = sinon.spy(scMock.connectors, "getById");

            const result = await connectorLogic.stop({id: connector.id, seconds: 100, json: false});

            expect(result.success).to.be.true;
            expect(result.id).to.be.equal(connector.id);

            expect(confirmStopSpy.calledOnce).to.be.true;
            confirmStopSpy.restore();

            expect(getByIdSpy.calledOnce).to.be.true;
            getByIdSpy.restore();
        });

        it("should return an error if connector is not charging", async () => {

            const connector = new Connector();
            connector.available = true;
            blockchain[connector.id] = connector;

            const getByIdSpy = sinon.spy(scMock.connectors, "getById");

            const result = await connectorLogic.stop({id: connector.id, seconds: 100, json: false});
            getByIdSpy.restore();

            expect(result.success).to.be.false;
            expect(result.id).to.be.equal(connector.id);
            expect(getByIdSpy.calledOnce).to.be.true;
        });

        it("should return an error on an unregistered connector", async () => {

            const connector = new Connector();

            const getByIdSpy = sinon.spy(scMock.connectors, "getById");
            const result = await connectorLogic.stop({id: connector.id, seconds: 100, json: false});
            getByIdSpy.restore();

            expect(result.success).to.be.false;
            expect(getByIdSpy.calledOnce).to.be.true;
        });

    });

});
