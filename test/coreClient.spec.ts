import 'mocha';
import { expect } from 'chai';
import { prepareConfigLocation } from '@motionwerk/sharecharge-common'
import { CoreClient } from '../src/coreClient';

describe('Core Client', () => {

    let client;

    prepareConfigLocation();

    beforeEach(() => client = CoreClient.getInstance());

    it('should resolve dependencies', () => {
        expect(client.coreService).to.not.equal(undefined);
        expect(client.subscriptionService).to.not.equal(undefined);
    });

});