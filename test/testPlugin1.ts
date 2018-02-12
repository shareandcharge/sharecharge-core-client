import { Plugin } from '../src/models/plugin';

export class Test1 implements Plugin {

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