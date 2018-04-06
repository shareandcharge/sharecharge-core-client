import { injectable, inject } from "inversify";
import LoggingProvider from "../src/services/loggingProvider";

@injectable()
export default class TestLoggingProvider extends LoggingProvider {

    constructor() {
        super();

        super.logger = {
            info: () => {
            },
            warn: () => {
            },
            error: () => {
            }
        }

    }
}