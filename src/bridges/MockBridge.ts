import { Subject } from 'rxjs';

import IBridge from '../models/iBridge';

export default class MockBridge implements IBridge {

    updater: any;

    private autoStop = new Subject<any>();
    autoStop$ = this.autoStop.asObservable();

    constructor() {
    }

    get name(): string {
        return this.constructor.name;
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

    async evseStatus(id?: string): Promise<any> {
        return true;
    }

    async cdr(id?: string): Promise<any> {
        return {
            start: Date.now() - 60000,
            stop: Date.now(),
            energy: 10000
        };
    }

    startUpdater(interval?: number): void {
        this.updater = setTimeout(async () => {

        }, interval || 30000)
    }

    stopUpdater(): void {
        clearTimeout(this.updater);
    }

}