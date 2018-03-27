import * as mocha from "mocha";

import { expect } from "chai";
import Parser from "../../src/utils/parser";

describe("Parser", function () {

    let parser;
    let path = __dirname;

    beforeEach(function () {
        parser = new Parser(true);
    });

    describe("#read()", () => {

        it("should read yaml file and return as string", function () {
            const configStr = parser.read(__dirname + "/test-config.yaml");
            expect(configStr.substr(0, 3)).to.equal("---");
        });

        it("should read the yaml config string and translate to js object", function () {
            const configString = parser.read(__dirname + "/test-config.yaml");
            const config = parser.translate(configString);
            expect(config.stage).to.equal("local");
        });

        it("should read the toml config string and translate to js object", function () {
            const configString = parser.read(__dirname + "/test-config.toml");
            const config = parser.translate(configString);
            expect(config.stage).to.equal("local");
        });

    });

});
