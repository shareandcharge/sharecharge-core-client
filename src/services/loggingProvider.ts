import { Logger, transports } from 'winston';
import { injectable, inject } from "inversify";

@injectable()
export default class LoggingProvider {

    protected logger;

    constructor() {
        this.logger = new Logger({
            level: 'info',
            transports: [
                new transports.Console({
                    timestamp: true,
                    colorize: true
                })
            ]
        });
    }

    public obtain() {
        return this.logger;
    }
}
