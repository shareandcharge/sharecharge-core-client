import IBridge from './iBridge';

export default interface IClientConfig {
    bridgePath: string;
    evsesPath: string;
    seed: string;
    stage: string;
    gasPrice: number;
    provider: string;
}