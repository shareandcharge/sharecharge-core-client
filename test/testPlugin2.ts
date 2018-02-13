import { Bridge } from '../src/models/bridge';

export class Test2 implements Bridge {

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

}