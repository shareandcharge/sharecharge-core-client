import { Subject } from 'rxjs';

import IBridge from '../interfaces/iBridge';

export default class MockBridge implements IBridge {

    updater: any;

    private autoStop = new Subject<any>();
    autoStop$ = this.autoStop.asObservable();
    autostopTimeout: any;

    constructor() {
    }

    get name(): string {
        return this.constructor.name;
    }

    async health(): Promise<boolean> {
        return true;
    }

    async start(parameters: any): Promise<any> {
        const timeout = 1000 * 60 * 5;
        clearTimeout(this.autostopTimeout);
        this.autostopTimeout = setTimeout(() => this.autoStop.next(parameters), timeout);
        return {data: '123'};
    }

    async stop(parameters: any): Promise<any> {
        clearTimeout(this.autostopTimeout);
        return {data: 50};
    }

    async cdr(parameters: any): Promise<any> {
        return {
            price: 100
        };
    }

}