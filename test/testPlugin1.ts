import { Subject } from 'rxjs';
import { Bridge } from '../src/models/bridge';

export class Test1 implements Bridge {

    updater: any;
    status = new Subject<(string | Error)[]>();
    status$ = this.status.asObservable();

    constructor() {}

    get name(): string {
        return 'test1';
    }

    async health(): Promise<boolean> {
        return true;
    }

    async start(parameters: any): Promise<any> {
        return { data: '123' };
    }

    async stop(parameteres: any): Promise<any> {
        return { data: 50 };
    }

    startUpdater(interval?: number): void {
        this.updater = setInterval(async () => {
            this.status.next(['123', '456']);
        }, interval || 30000)
    }

    stopUpdater(): void {
        clearInterval(this.updater);
    }

}