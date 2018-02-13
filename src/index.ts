import { Config } from './models/config';
import { Plugin } from './models/plugin';
import { ShareAndCharge } from './lib/src/index';
import { PoleContract } from './lib/src/models/pole-contract';
import { TestContract } from './lib/test/test-contract';
import { logger } from './utils/logger';

export class Client {

    private readonly config: Config;
    private plugin: Plugin;
    private sc: ShareAndCharge;
    private readonly id: string;
    private readonly pass: string;

    constructor(config: Config, id: string, pass: string) {
        this.config = config;
        this.plugin = this.config.plugin;
        this.id = id;
        this.pass = pass;
        const contract = !config.test ? new PoleContract(this.pass) : new TestContract();
        this.sc = new ShareAndCharge(contract);
    }

    get pluginName(): string {
        return this.plugin.name;
    }
    
    start(): void {
        this.checkHealth()
        .then(() => {
            this.subscribeToStartRequests();
            this.subscribeToStopRequests();
            this.logOnStart();
        }).catch(() => {
            logger.info('Backend not healthy! Exiting...');
            process.exit(1)
        });
    }
    
    private async checkHealth(): Promise<void> {
        await this.plugin.health();
    }
    
    private logOnStart(): void {
        logger.info(`Core Client connected to ${this.pluginName} bridge`)
        logger.info('Listening for events...');
    }
    
    private filter(params): boolean {
        return params.clientId === this.id;
    }

    private subscribeToStartRequests(): void {
        this.sc.start$.subscribe(async request => {
            if (this.filter(request.params)) {
                try {
                    logger.info(`Starting charge on ${request.params.connectorId}`);
                    const res = await this.plugin.start(request.params);
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

    private subscribeToStopRequests(): void {
        this.sc.stop$.subscribe(async request => {
            if (this.filter(request.params)) {
                try {
                    logger.info(`Stopping charge on ${request.params.connectorId}`);
                    const res = await this.plugin.stop(request.params);
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

}