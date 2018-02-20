const yaml = require('js-yaml');
import * as fs from 'fs';
import * as path from 'path';

import { Config } from '../models/config';

export class Parser {

    path: string;

    constructor(test?: boolean) {
        this.path = test ? '../../../test/' : '../../';
    }

    read(path: string): string {
        return fs.readFileSync(path, 'utf8');
    }

    translate(configString: string): any {
        return yaml.safeLoad(configString);
    }

    write(config: any): void {
        const configString = 
`import { ${config.bridge.name} } from '${config.bridge.path}';
export const config = {
    test: ${ config.test ? true : false },
    bridge: new ${config.bridge.name}(),
    statusUpdateInterval: ${config.statusUpdateInterval},
}`
        fs.writeFileSync(path.join(__dirname + this.path + 'config.ts'), configString);
    }

}