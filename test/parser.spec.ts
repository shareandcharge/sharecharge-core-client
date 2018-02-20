import { expect } from 'chai';
const fs = require('fs');

import { Parser} from '../src/utils/parser';
import { Bridge } from '../test/testBridge1';

describe('Yaml parser', function(){

    let parser;
    let path = __dirname;

    beforeEach(function(){
        parser = new Parser(true);
    });

    it('should read yaml file and return as string', function() {
        const configStr = parser.read(__dirname + '/test.yaml');
        expect(configStr.substr(0,3)).to.equal('---');
    });
    
    it('should read the yaml config string and translate to js object', function() {
        const configString = parser.read(__dirname + '/test.yaml');
        const config = parser.translate(configString);
        expect(config.statusUpdateInterval).to.equal(2000);
    });

    it('should read the toml config string and translate to js object', function() {
        const configString = parser.read(__dirname + '/test.toml');
        const config = parser.translate(configString);
        expect(config.statusUpdateInterval).to.equal(2000);
    });

    it('should write the config.ts file', function(done) {
        const configString = parser.read(__dirname + '/test.yaml');
        const config = parser.translate(configString);
        parser.write(config, path);
        fs.stat('./config.ts', (err, res) => {
            expect(res.size > 0).to.equal(true);
            done();
        });
    });

});
