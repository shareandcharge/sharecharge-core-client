import * as mocha from "mocha";
import { expect } from "chai";
import OCPIBridge from "../../src/bridges/OCPIBridge";

describe("OCPI Bridge", () => {

  before(() => { });

  describe("#register", () => {
    it.only("should perform the OCPI registration process", async () => {
      const bridge = new OCPIBridge();
      bridge.register();
    });
  });

});
