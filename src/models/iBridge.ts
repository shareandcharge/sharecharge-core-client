import IResult from "./iResult";

export default interface IBridge {
    name: string;

    health(): Promise<boolean>;

    start(metadata: any): Promise<IResult>;

    stop(parameters: any): Promise<IResult>;

    startUpdater(interval?: number): void;

    stopUpdater(): void;

    connectorStatus(id?: string): Promise<any>;
}
