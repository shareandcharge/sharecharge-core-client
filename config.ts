import { Bridge } from './test/testBridge1';

export const config = {
    test: true,
    bridge: new Bridge(),
    statusUpdateInterval: 2000,
}