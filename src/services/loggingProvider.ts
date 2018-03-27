import { Logger, transports } from 'winston';
import { injectable } from "inversify";

@injectable()
export default class LoggingProvider {

    protected logger;

    constructor() {
        this.logger = new Logger({
            level: 'debug',
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
