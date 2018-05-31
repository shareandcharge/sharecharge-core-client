import { Subject } from 'rxjs';
import { IBridge } from '@motionwerk/sharecharge-common';

export default class ErrorBridge implements IBridge {

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
        throw Error('Could not start');
    }

    async stop(parameters: any): Promise<any> {
        return {data: 50};
    }

    async cdr(parameters: any): Promise<any> {
        return {
            price: 0
        };
    }

}