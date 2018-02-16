import { BridgeInterface } from './bridge';

export interface Config {
    test?: boolean;
    bridge: BridgeInterface;
    statusUpdateInterval?: number;
}