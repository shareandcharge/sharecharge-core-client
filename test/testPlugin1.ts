import { Subject } from 'rxjs';
import { Bridge, StatusObject } from '../src/models/bridge';

export class Test1 implements Bridge {

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

    async stop(parameteres: any): Promise<any> {
        return { data: 50 };
    }

    startUpdater(interval?: number): void {
        this.updater = setTimeout(async () => {
            this.status.next({
                points: [
                    '123',
                    '456'
                ],
                errors: [
                    Error(JSON.stringify({ point: '012', error: '500 Server Error'})),
                    Error(JSON.stringify({ point: '789', error: 'Charge Point does not exist'})),
                ]
            });
        }, interval || 30000)
    }

    stopUpdater(): void {
        clearTimeout(this.updater);
    }

}