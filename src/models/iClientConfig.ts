import IBridge from './iBridge';

export default interface IClientConfig {
    test?: boolean;
    bridge: IBridge;
    statusUpdateInterval?: number;
    id: string;
    pass: string;
    seed: string;
    stage: string;
    gasPrice: number;
    provider: string;
    connectors: any;
}