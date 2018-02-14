import { Test1 } from './test/testPlugin1';
import { Test2 } from './test/testPlugin2';

export const config = {
    // id: '0x1234000000000000000000000000000000000000000000000000000000000000',
    // pass: '',
    test: false,
    bridge: new Test1(),
    statusUpdateInterval: 1000,
};