import * as yaml from 'js-yaml';
import * as toml from 'toml';
import * as fs from 'fs';
import * as path from 'path';

import { Config } from '../models/config';

export class Parser {

    path: string;
    extension: string;

    constructor(test?: boolean) {
        this.extension = '';
        this.path = test ? '../../../test/' : '../../../';
    }

    read(filepath: string): string {
        this.extension = path.extname(filepath);
        return fs.readFileSync(filepath, 'utf8');
    }

    translate(configString: string): any {
        switch (this.extension) {
        case '.yaml':
            return this.yaml(configString);
        case '.toml':
            return this.toml(configString);
        }
    }

    yaml(config: string): any {
        return yaml.safeLoad(config);
    }

    toml(config: string): any {
        return toml.parse(config);
    }

}