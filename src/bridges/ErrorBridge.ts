import IBridge from '../models/iBridge';
import StatusObject from "../models/iStatusObject";

export default class ErrorBridge implements IBridge {

    updater: any;

    constructor() {
    }

    get name(): string {
        return 'test2';
    }

    async health(): Promise<boolean> {
        return true;
    }

    async start(parameters: any): Promise<any> {
        throw Error('Could not start');
    }

    async stop(parameteres: any): Promise<any> {
        return {data: 50};
    }

    async connectorStatus(id?: string): Promise<any> {
        return true;
    }

    startUpdater(interval?: number): void {
        this.updater = setInterval(async () => {

        }, interval || 30000);
    }

    stopUpdater(): void {
        clearInterval(this.updater);
    }

}