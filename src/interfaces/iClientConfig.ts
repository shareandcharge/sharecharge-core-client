import IBridge from './iBridge';

export default interface IClientConfig {
    bridgePath: string;
    seed: string;
    stage: string;
    gasPrice: number;
    ethProvider: string;
}