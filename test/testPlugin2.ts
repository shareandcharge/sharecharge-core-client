import { Subject } from 'rxjs';
import { Bridge } from '../src/models/bridge';

export class Test2 implements Bridge {

    updater: any;
    status = new Subject<(string | Error)[]>();
    status$ = this.status.asObservable();

    constructor() {}

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
        return { data: 50 };
    }

    startUpdater(interval?: number): void {
        this.updater = setInterval(async () => {
            this.status.next([Error(JSON.stringify({ point: '456', error: 'charge point does not exist' }))]);
        }, interval || 30000);
    }

    stopUpdater(): void {
        clearInterval(this.updater);
    }

}