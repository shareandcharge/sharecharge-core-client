import { Bridge } from '../src/models/bridge';

export class Test1 implements Bridge {

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

}