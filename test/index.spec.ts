import { expect } from 'chai';
import { Client } from '../src/index';
import { config } from './testConfig';

describe('Core Client', function() {

    let client;
   
    beforeEach(async function() {
        client = new Client(config);
    });

    it('should initialise core client with correct plugin', function() {
        const plugin = client.pluginName;
        expect(plugin).to.equal('test1');
    });

    it('should handle start request events and call start on CPO backend');

});