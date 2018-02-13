import { Test1 } from './testPlugin1';

export const config = {
    prod: false,
    id: '0x12345',
    pass: '123',
    plugin: new Test1()
};