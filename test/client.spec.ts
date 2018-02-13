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

    it('should initialise core client with correct plugin', function() {
        const bridge = client.bridgeName;
        expect(bridge).to.equal('test1');
    });

    it('should filter requests specific to the bridge', function() {
        const params = { clientId: '123' };
        expect(client.filter(params)).to.equal(true);
    });

    it('should filter out requests not managed by the bridge', function() {
        const params = { clientId: '1234' };
        expect(client.filter(params)).to.equal(false);
    });

    it('should return true if bridge is healthy', async function() {
        const healthy = await client.checkHealth();
        expect(healthy).to.equal(true);
    });




});