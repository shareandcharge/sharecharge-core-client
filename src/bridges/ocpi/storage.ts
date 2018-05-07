import * as config from 'config';

export default class Storage {

  private storage: any = {};

  constructor() {
    this.storage['cpoToken'] = config.get<string>('cpoToken');
    this.storage['emspToken'] = config.get<string>('emspToken');
    this.storage['cpoServer'] = config.get<string>('cpoServer');
    this.storage['emspServer'] = config.get<string>('emspServer');
    this.storage['emspToken'] = 'sca28080a4f9711e89c2dfa7ae01bbebc';
  }

  persistCPOEndPoints(endPoints: any) {
    this.storage['cpoEndPoints'] = endPoints;
  }

  getCPOEndPoint(name: string): string {
    return this.storage['cpoEndPoints'] ? this.storage['cpoEndPoints'][name] : '';
  }

  getCPOAuthToken(): string {
    return this.storage['cpoToken'] || '';
  }

  getCPOServer(): string {
    return this.storage['cpoServer'] || '';
  }

  getEMSPAuthToken(): string {
    return this.storage['emspToken'] || '';
  }

  getEMSPServer(): string {
    return this.storage['emspServer'] || '';
  }

  getEMSPToken(): string {
    return this.storage['emspToken'] || '';
  }
}
