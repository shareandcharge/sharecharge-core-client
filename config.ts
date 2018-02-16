import { Bridge } from './test/testBridge1';
// import { Bridge } from './test/testBridge2';
// import { Bridge } from './src/bridge/src/bridge';

export const config = {
    // id: '0x1234000000000000000000000000000000000000000000000000000000000000',
    // pass: '',
    test: false,
    bridge: new Bridge(/*bridge has its own config for now*/),
    statusUpdateInterval: 1000,
};