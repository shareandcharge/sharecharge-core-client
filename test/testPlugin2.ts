import { Plugin } from '../src/models/plugin';

export class Test2 implements Plugin {

    constructor() {}

    get name(): string {
        return 'test2';
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