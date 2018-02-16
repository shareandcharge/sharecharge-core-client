import {Contract} from "./lib/src/services/contract";
import {TestContract} from "./lib/test/test-contract";
import * as commander from "commander";

import {config} from "../config";

commander
    .version("0.1.0")
    .usage("sc");

commander
    .command("cp-status <id>")
    .action(function (id) {
        console.log("cp-status", id);
        callContract();
        process.exit(0);
    });

commander
    .command("cp-enable <id>")
    .action(function (id) {
        console.log("cp-enable", id);
        callContract();
        process.exit(0);
    });

commander
    .command("cp-disable <id>")
    .action(function (id) {
        console.log("cp-disable", id);
        callContract();
        process.exit(0);
    });

function callContract() {
    const contract = config.test ? new TestContract() : new Contract(config.pass);
}

commander.parse(process.argv);

if (process.argv.length < 3) {
    commander.outputHelp();
    process.exit(1);
}