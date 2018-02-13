import { Test1 } from './test/testPlugin1';
import { Test2 } from './test/testPlugin2';

export const config = {
    prod: true,
    id: '0x1234000000000000000000000000000000000000000000000000000000000000',
    pass: '',
    plugin: new Test1()
}