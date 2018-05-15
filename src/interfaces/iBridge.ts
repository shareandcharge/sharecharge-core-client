import { Observable } from 'rxjs';
import IResult from "./iResult";
import ICDR from "./iCDR";

export default interface IBridge {
    name: string;

    autoStop$: Observable<any>;

    health(): Promise<boolean>;

    start(metadata: any): Promise<IResult>;

    stop(parameters: any): Promise<IResult>;

    cdr(id?: string): Promise<ICDR>;
}
