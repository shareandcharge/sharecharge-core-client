import * as mocha from 'mocha';
import { expect } from 'chai';
import * as sinon from "sinon";

import ConnectorLogic from "../../src/cli/connector.logic";
import { Connector, ToolKit } from "sharecharge-lib";
import { loadConfigFromFile } from "../../src/utils/config";
import IClientConfig from "../../src/models/iClientConfig";

const testConfigPath = "./test/config.yaml";

describe('ConnectorLogic', () => {

    let scMock: any, config: IClientConfig, db: object, connectorLogic: ConnectorLogic, connectorModifiers;

    before(() => {

        config = loadConfigFromFile(testConfigPath);
        
        config.logger = {
            info: () => {
            },
            warn: () => {

            }
        };

        connectorModifiers = {
            create: (connector) => {

                db[connector.id] = connector;
            },
            update: (connector) => {

                db[connector.id] = connector;
            }
        };

        scMock = {
            connectors: {
                useWallet: (wallet) => {
                    return connectorModifiers
                },
                getById: (id) => {
                    return db[id] || Connector.deserialize({id, owner: config.id});
                },
                isPersisted: (connector: Connector) => {

                    return !!db[connector.id]
                }
            }
        };

        connectorLogic = new ConnectorLogic(config, scMock);
    });

    beforeEach(() => {
        db = {};
    });

    describe("#register()", () => {

        it('should register a connector correctly', async () => {

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

    describe("#enable()", () => {

        it('should enable a disabled connector', async () => {

            const idToTest = "0x100000000111";

            db[idToTest] = Connector.deserialize({id: idToTest, available: false});

            const getByIdSpy = sinon.spy(scMock.connectors, "getById");
            const updateSpy = sinon.spy(connectorModifiers, "update");

            const result = await connectorLogic.enable({id: idToTest, json: false});

            expect(db[idToTest].available).to.be.true;
            expect(result.success).to.be.true;

            expect(getByIdSpy.calledOnce).to.be.true;
            getByIdSpy.restore();

            expect(updateSpy.calledOnce).to.be.true;
            updateSpy.restore();
        });
    });

    describe("#registerAll()", () => {

        it('should register all connectors correctly', async () => {

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

        it('output info about the connector correclty', async () => {

            const idToTest = ToolKit.randomBytes32String();
            const owner = ToolKit.randomBytes32String();
            const plugMask = 16;
            const available = false;

            db[idToTest] = Connector.deserialize({
                id: idToTest,
                owner: owner,
                plugMask: plugMask,
                available: available
            });

            const result = await connectorLogic.info({id: idToTest, json: false});

            expect(result.id).to.equal(idToTest);
            expect(result.owner).to.equal(owner);
            expect(result.plugTypes).to.contain(plugMask);
            expect(result.available).to.equal(available);
        });

        it("fails if the connector is not persisted", async () => {

            const idToTest = ToolKit.randomBytes32String();

            const result = await connectorLogic.info({id: idToTest, json: false});

            expect(result).to.equal(null);
        });
    });
});
