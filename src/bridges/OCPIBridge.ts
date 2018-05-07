import { fork } from 'child_process';

import { default as MSPService } from './ocpi/mspService';
import Storage from './ocpi/storage';
import CPOService from './ocpi/cpoService';

class OCPIBridge {

  constructor(private cpoService: CPOService) {
    MSPService.on('started', (...args) => {
      // this.register();
    });

    MSPService.on('registered', (...args) => {
      console.log(args);
    });
  }

  async register() {
    await this.cpoService.register();
  }

  async start(parameters: any) {
    const locations = await this.cpoService.locations();
    await this.cpoService.start();
  }

  async stop(parameters: any) {
  }

  async updateToken() {
    await this.cpoService.updateToken();
  }

  async getLocations() {
  }

};

const storage = new Storage();
const cpoService = new CPOService(storage);
const bridge = new OCPIBridge(cpoService);
bridge.updateToken();

export default OCPIBridge;