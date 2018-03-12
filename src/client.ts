import { BridgeInterface } from './models/bridge';
import { ShareAndCharge, Contract, TestContract } from 'sharecharge-lib'
import { logger } from './utils/logger';

export class Client {

    private readonly config: any;
    private bridge: BridgeInterface;
    private sc: ShareAndCharge;

    constructor(config: any) {
        this.config = config;
        this.bridge = this.config.bridge;
        const contract = config.test ? new TestContract() : new Contract({pass: this.config.pass});
        logger.debug("Type of contract:", contract.constructor.name);
        this.sc = new ShareAndCharge({contract});
    }

    private get bridgeName(): string {
        return this.bridge.name;
    }

    private async checkHealth(): Promise<boolean> {
        return this.bridge.health();
    }

    private logOnStart(): void {
        logger.info(`Core Client connected to ${this.bridgeName} bridge`);
        logger.info('Listening for events...');
    }

    private filter(params): boolean {
        return params.clientId === this.config.id;
    }

    private handleStartRequests(): void {
        this.sc.start$.subscribe(async request => {
            if (this.filter(request.params)) {
                try {
                    logger.info(`Starting charge on ${request.params.connectorId}`);
                    const res = await this.bridge.start(request.params);
                    logger.debug('Bridge start response: ' + JSON.stringify(res));
                    const health = await this.bridge.health();
                    logger.debug('Bridge status following start:', health);
                    const receipt = await request.success();
                    logger.debug('Start confirmation receipt: ' + JSON.stringify(receipt));
                } catch (err) {
                    logger.info(err.message);
                    const receipt = await request.failure();
                    logger.debug('Error receipt: ' + JSON.stringify(receipt));
                }
            }
        });
    }

    private handleStopRequests(): void {
        this.sc.stop$.subscribe(async request => {
            if (this.filter(request.params)) {
                try {
                    logger.info(`Stopping charge on ${request.params.connectorId}`);
                    const res = await this.bridge.stop(request.params);
                    logger.debug('Bridge stop response: ' + JSON.stringify(res));
                    const health = await this.bridge.health();
                    logger.debug('Bridge status following stop:', health);
                    const receipt = await request.success();
                    logger.debug('Stop confirmation receipt: ' + JSON.stringify(receipt));
                } catch (err) {
                    logger.info(err.message);
                    const receipt = await request.failure();
                    logger.debug('Error receipt: ' + JSON.stringify(receipt));
                }
            }
        });
    }

    private handleStatusUpdates(): void {
        this.bridge.status$.subscribe(async update => {
            update.errors.forEach(err => logger.warn('Status update error: ' + err.message));
            if (update.points[0]) {
                update.points.forEach(async point => {
                    try {
                        const receipt = await this.sc.setUnavailable(point, this.config.id);
                        if (receipt && receipt.blockNumber) {
                            logger.info(`Updated ${point} to unavailable on contract`);
                        }
                    } catch (err) {
                        logger.warn(`Error updating ${point}: ${err.message}`);
                    }
                });
            }
        });
    }

    private register(): void {
        Object.values(this.config.connectors).forEach(async conn => {
            try {
                const receipt = await this.sc.registerConnector(conn, this.config.id)
                if (receipt.blockNumber) {
                    logger.info(`Registered ${conn.id}`);
                }
            } catch (err) {
                logger.warn(`Error registering ${conn.id}: ${err.message}`);
            }
        });
    }

    start(): void {
        this.checkHealth()
            .then(health => {
                logger.info('Configured to update every ' + this.config.statusInterval + 'ms');
                logger.debug('Bridge status: ' + health);
                if (this.config.connectors) {
                    this.register();
                }
                this.bridge.startUpdater(this.config.statusInterval);
                this.handleStartRequests();
                this.handleStopRequests();
                this.handleStatusUpdates();
                this.logOnStart();
            }).catch(() => {
            logger.info('Backend not healthy! Exiting...');
            process.exit(1)
        });
    }

    stopUpdater(): void {
        this.bridge.stopUpdater();
    }
}