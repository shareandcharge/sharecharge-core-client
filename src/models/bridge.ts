import { Observable } from 'rxjs';

export interface Bridge {
    status$: Observable<StatusObject>;
    name: string;
    health(): Promise<boolean>;
    start(metadata: any): Promise<Result>;
    stop(parameters: any): Promise<Result>;
    startUpdater(interval?: number): void;
    stopUpdater(): void;
}

export interface StartParameters {
    alias: string;
    station: string;
    point: string;
    plug: string;
}

export interface Result {
    data;
}

export interface StatusObject {
    points: string[];
    errors: Error[];
}