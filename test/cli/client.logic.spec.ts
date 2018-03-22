import * as mocha from 'mocha';
import { expect } from 'chai';
import * as sinon from "sinon";

import ClientLogic from "../../src/cli/client.logic";
import IClientConfig from "../../src/models/iClientConfig";

const testConfigPath = "./test/cli/config.yaml";

describe('ClientLogic', () => {

    let config: IClientConfig, clientLogic: ClientLogic;

    beforeEach(() => {
        clientLogic = new ClientLogic(testConfigPath);
    });

    describe("#start()", () => {

        it('should start the client', async () => {

            const result = await clientLogic.start({});
            expect(result).to.equal(true);
        });
    });
});
