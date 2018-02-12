export interface Plugin {
    name: string;
    health(): Promise<boolean>;
    start(metadata: StartParameters): Promise<Result>;
    stop(parameters: StopParameters): Promise<Result>;
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