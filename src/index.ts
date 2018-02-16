import {Config} from './models/config';
import {Bridge} from './models/bridge';
import {ShareAndCharge} from './lib/src/index';
import {Contract} from './lib/src/services/contract';
import {TestContract} from './lib/test/test-contract';
import {logger} from './utils/logger';

export class Client {

    private readonly config: Config;
    private bridge: Bridge;
    private sc: ShareAndCharge;
    private readonly id: string;
    private readonly pass: string;

    constructor(config: Config, id: string, pass: string) {
        this.config = config;
        this.bridge = this.config.bridge;
        this.id = id;
        this.pass = pass;
        const contract = config.test ? new TestContract() : new Contract(this.pass);
        this.sc = new ShareAndCharge(contract);
    }

    private get bridgeName(): string {
        return this.bridge.name;
    }

    private async checkHealth(): Promise<boolean> {
        return this.bridge.health();
    }

    private logOnStart(): void {
        logger.info(`Core Client connected to ${this.bridgeName} bridge`)
        logger.info('Listening for events...');
    }

    private filter(params): boolean {
        return params.clientId === this.id;
    }

    private handleStartRequests(): void {
        this.sc.start$.subscribe(async request => {
            if (this.filter(request.params)) {
                try {
                    logger.info(`Starting charge on ${request.params.connectorId}`);
                    const res = await this.bridge.start(request.params);
                    logger.info('Bridge start response: ' + res.data);
                    const receipt = await request.success();
                    logger.info('Start confirmation receipt: ' + JSON.stringify(receipt));
                } catch (err) {
                    logger.info(err.message);
                    const receipt = await request.failure();
                    logger.info('Error receipt: ' + JSON.stringify(receipt));
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
                    logger.info('Bridge stop response: ' + res.data);
                    const receipt = await request.success();
                    logger.info('Stop confirmation receipt: ' + JSON.stringify(receipt));
                } catch (err) {
                    logger.info(err.message);
                    const receipt = await request.failure();
                    logger.info('Error receipt: ' + JSON.stringify(receipt));
                }
            }
        });
    }

    private handleStatusUpdates(): void {
        this.bridge.status$.subscribe(async update => {
            update.errors.forEach(err => logger.warn('Status update error: ' + err.message));
            try {
                const receipt = await this.sc.updateStatus(update.points, this.id);
                logger.info(JSON.stringify(receipt));
            } catch (err) {
                logger.warn(err.message);
            }
        });
    }

    start(): void {

        this.checkHealth()
            .then(() => {
                logger.info('Configured to update every ' + this.config.statusUpdateInterval + 'ms');
                this.bridge.startUpdater(this.config.statusUpdateInterval);
                this.handleStartRequests();
                this.handleStopRequests();
                // this.handleStatusUpdates()
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