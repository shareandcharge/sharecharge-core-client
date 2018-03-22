import * as mocha from 'mocha';
import { expect } from 'chai';
import * as sinon from "sinon";

import ConnectorLogic from "../../src/cli/connector.logic";
import { Connector } from "sharecharge-lib";
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

            await connectorLogic.register({id: idToTest, json: true});

            const connector: Connector = await scMock.connectors.getById(idToTest);

            expect(connector.id).to.include(idToTest);
            expect(connector.available).to.equal(true);
            expect(connector.owner).to.include(config.id);
        });

    });

});
