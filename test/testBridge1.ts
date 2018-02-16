import { Subject } from 'rxjs';
import { BridgeInterface, StatusObject } from '../src/models/bridge';

export class Bridge implements BridgeInterface {

    updater: any;
    status = new Subject<StatusObject>();
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

    async stop(parameters: any): Promise<any> {
        return { data: 50 };
    }

    async connectorStatus(id?: string): Promise<any> {
        return true;
    }

    startUpdater(interval?: number): void {
        this.updater = setTimeout(async () => {
            this.status.next({
                points: [
                    '0x01'
                ],
                errors: [
                    Error(JSON.stringify({ point: '0x03', error: '500 Server Error'})),
                    Error(JSON.stringify({ point: '0x04', error: 'Charge Point does not exist'})),
                ]
            });
        }, interval || 30000)
    }

    stopUpdater(): void {
        clearTimeout(this.updater);
    }

}