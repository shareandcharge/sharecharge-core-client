import { Subject } from 'rxjs';
import { BridgeInterface, StatusObject } from '../src/models/bridge';

export default class Bridge implements BridgeInterface {

    updater: any;
    status = new Subject<StatusObject>();
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

    async connectorStatus(id?: string): Promise<any> {
        return true;
    }

    startUpdater(interval?: number): void {
        this.updater = setInterval(async () => {
            this.status.next({
                points: [],
                errors: []
            });
        }, interval || 30000);
    }

    stopUpdater(): void {
        clearInterval(this.updater);
    }

}