import { Plugin } from './plugin';

export interface Config {
    prod: boolean;
    id: string,
    pass: string,
    plugin: Plugin;
}