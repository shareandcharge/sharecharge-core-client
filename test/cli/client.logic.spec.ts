import * as mocha from 'mocha';
import { expect } from 'chai';

import ClientLogic from "../../src/cli/client.logic";
import ShareChargeCoreClient from "../../src/shareChargeCoreClient";
import { Symbols } from "../../src/symbols";
import TestConfigProvider from "../testConfigProvider";
import TestLoggingProvider from "../testLoggingProvider";

describe('ClientLogic', () => {

    let clientLogic: ClientLogic;

    beforeEach(() => {
        clientLogic = new ClientLogic();
        ShareChargeCoreClient.rebind(Symbols.LoggingProvider, TestLoggingProvider);
        ShareChargeCoreClient.rebind(Symbols.ConfigProvider, TestConfigProvider);
    });

    describe("#start()", () => {

        it('should start the client', async () => {

            const result = await clientLogic.start({});
            expect(result).to.equal(true);
        });
    });
});
