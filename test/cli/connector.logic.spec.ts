import * as mocha from 'mocha';
import { expect } from 'chai';
import * as sinon from "sinon";

import ConnectorLogic from "../../src/cli/connector.logic";
import { Connector, ToolKit } from "sharecharge-lib";
import { loadConfigFromFile } from "../../src/utils/config";

const testConfigPath = "./test/cli/config.yaml";

describe('Connector.Logic', () => {

    let scMock;
    let config;
    let connectorLogic: ConnectorLogic;
    let db;

    before(() => {

        config = loadConfigFromFile(testConfigPath);
        scMock = {
            connectors: {
                useWallet: () => {
                    return {
                        create: (connector) => {

                            db[connector.id] = connector;
                        }
                    }

                },
                getById: (id) => {
                    return db[id] || Connector.deserialize({id, owner: config.id});
                }
            }
        };
        connectorLogic = new ConnectorLogic(testConfigPath, scMock);
    });

    beforeEach(() => {
        db = {};
    });

    describe("#register()", () => {

        it('should register a connector correctly', async () => {

            const idToTest = "0x1000000001";

            const doRegisterSpy = sinon.spy(connectorLogic, "doRegister");

            await connectorLogic.register({id: idToTest, json: false});
            const connector: Connector = await scMock.connectors.getById(idToTest);

            expect(doRegisterSpy.calledOnce).to.be.true;
            expect(connector.id).to.include(idToTest);
            expect(connector.available).to.equal(true);
            expect(connector.owner).to.include(config.id);

            doRegisterSpy.restore();
        });

    });

    describe("#registerAll()", () => {

        it('should register all connectors correctly', async () => {

            const doRegisterSpy = sinon.spy(connectorLogic, "doRegister");

            await connectorLogic.registerAll({json: false});

            expect(doRegisterSpy.callCount).to.be.equal(Object.keys(config.connectors).length);
            doRegisterSpy.restore();
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

    });

});
