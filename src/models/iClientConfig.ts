import IBridge from './iBridge';

export default interface IClientConfig {
    bridgePath: string;
    stationsPath: string;
    seed: string;
    stage: string;
    gasPrice: number;
    provider: string;
    tokenAddress: string;
}