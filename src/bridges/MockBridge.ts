import { Subject } from 'rxjs';

import IBridge from '../interfaces/iBridge';

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
        setTimeout(() => this.autoStop.next(parameters), 10000);
        return {data: '123'};
    }

    async stop(parameters: any): Promise<any> {
        return {data: 50};
    }

    async cdr(id?: string): Promise<any> {
        return {
            price: 100
        };
    }

}