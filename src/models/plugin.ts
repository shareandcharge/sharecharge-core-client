export interface Plugin {
    name: string;
    health(): Promise<boolean>;
    start(StartParameters: any): Promise<Result>;
    stop(parameters: any): Promise<Result>;
}

export interface StartParameters {
    alias: string;
    station: string;
    point: string;
    plug: string;
}

export interface StopParameters {
    user: string;
}

export interface Result {
    data;
}