import * as mocha from 'mocha';
import { expect } from 'chai';
import * as sinon from "sinon";

import ClientLogic from "../../src/cli/client.logic";
import { loadConfigFromFile } from "../../src/utils/config";

const testConfigPath = "./test/config.yaml";

describe('ClientLogic', () => {

    let clientLogic: ClientLogic;

    beforeEach(() => {
        const config = loadConfigFromFile(testConfigPath);
        config.logger = {
            info: () => {
            },
            warn: () => {

            }
        };
        clientLogic = new ClientLogic(config);
    });

    describe("#start()", () => {

        it('should start the client', async () => {

            const result = await clientLogic.start({});
            expect(result).to.equal(true);
        });
    });
});
