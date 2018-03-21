import IBridge from '../models/iBridge';
import StatusObject from "../models/iStatusObject";

export default class MockBridge implements IBridge {

    updater: any;

    constructor() {
    }

    get name(): string {
        return 'test1';
    }

    async health(): Promise<boolean> {
        return true;
    }

    async start(parameters: any): Promise<any> {
        return {data: '123'};
    }

    async stop(parameters: any): Promise<any> {
        return {data: 50};
    }

    async connectorStatus(id?: string): Promise<any> {
        return true;
    }

    startUpdater(interval?: number): void {
        this.updater = setTimeout(async () => {

        }, interval || 30000)
    }

    stopUpdater(): void {
        clearTimeout(this.updater);
    }

}