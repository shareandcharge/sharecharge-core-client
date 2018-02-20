import * as yaml from 'js-yaml';
import * as toml from 'toml';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

import { Config } from '../models/config';

export class Parser {

    path: string;
    extension: string;

    constructor(test?: boolean) {
        this.path = test ? '../../../test/' : '../../';
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

    write(config: any): void {
        const source = fs.readFileSync(path.join(__dirname, '../templates/config.txt'));
        const template = handlebars.compile(source.toString());
        const data = template(config);
        fs.writeFileSync(path.join(__dirname + this.path + 'config.ts'), data);
    }

}