import { Test1 } from './testPlugin1';

export const config = {
    test: true,
    bridge: new Test1()
};