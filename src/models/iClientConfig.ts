import IBridge from './iBridge';

export default interface IClientConfig {
    bridgePath: string;
    connectorsPath: string;
    seed: string;
    stage: string;
    gasPrice: number;
    provider: string;
}