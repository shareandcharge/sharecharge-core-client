import IBridge from '../models/iBridge';

export default class ErrorBridge implements IBridge {

    updater: any;

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

    async stop(parameteres: any): Promise<any> {
        return {data: 50};
    }

    async evseStatus(id?: string): Promise<any> {
        return true;
    }

    async cdr(id?: string): Promise<any> {
        return {};
    }

    startUpdater(interval?: number): void {
        this.updater = setInterval(async () => {

        }, interval || 30000);
    }

    stopUpdater(): void {
        clearInterval(this.updater);
    }

}