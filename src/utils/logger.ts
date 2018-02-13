import { Logger, transports } from 'winston';

export const logger = new Logger({
    level: 'info',
    transports: [
        new transports.Console({
            timestamp: true
        })
    ]
});