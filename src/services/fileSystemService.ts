import * as fs from 'fs';
import * as path from 'path';
import { ICDR, getConfigDir } from '@motionwerk/sharecharge-common/dist/common';

export default class FileSystemService {

    public writeChargeDetailRecord(sessionId: string, cdr: ICDR, complete: boolean): void {
        const directory = path.join(getConfigDir() + `./chargedetailrecords/${complete ? 'complete' : 'pending'}`);
        try {
            const filename = directory + `/${cdr.evseId}_${sessionId}.json`
            const data = JSON.stringify(cdr, null, 2);
            fs.writeFileSync(filename, data);
        } catch (err) {
            throw Error(err.message);
        }
    }

}