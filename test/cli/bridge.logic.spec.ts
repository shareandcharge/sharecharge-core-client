import * as mocha from 'mocha';
import { expect } from 'chai';
import * as sinon from "sinon";

import BridgeLogic from "../../src/cli/bridge.logic";
import IClientConfig from "../../src/models/iClientConfig";
import { loadConfigFromFile } from "../../src/utils/config";
import IBridge from "../../src/models/iBridge";

const testConfigPath = "./test/config.yaml";

describe('ClientLogic', () => {

    let config: IClientConfig, bridgeLogic: BridgeLogic;

    beforeEach(() => {
        config = loadConfigFromFile(testConfigPath);
        config.logger = {
          info: () => {}
        };
        bridgeLogic = new BridgeLogic(config);
    });

    describe("#status()", () => {

        it('should return the configured bridge correctly', async () => {

            const result = await bridgeLogic.status({});
            expect(result.name).to.equal("test1");
        });

        it('should return available in normal cases', async () => {

            const result = await bridgeLogic.status({});
            expect(result.bridge.isAvailable).to.equal(true);
        });

        it('should return not available if it is not available', async () => {

            config.bridge = <IBridge>{
                async health(): Promise<boolean> {
                    return false;
                }
            };

            const bl = new BridgeLogic(config);
            const result = await bl.status({});
            expect(result.bridge.isAvailable).to.equal(false);
        });
    });
});
