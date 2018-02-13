import { expect } from 'chai';
import { Client } from '../src/index';
import { config } from './testConfig';

describe('Core Client', function() {

    let client;
   
    beforeEach(async function() {
        const id = '123';
        const pass = '123';
        client = new Client(config, id, pass);
    });

    it('should initialise core client with correct plugin', function(done) {
        const plugin = client.pluginName;
        expect(plugin).to.equal('test1');
        done();
    });

});