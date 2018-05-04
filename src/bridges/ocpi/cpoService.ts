import * as request from 'request-promise';
import Storage from '../ocpi/storage';

export default class CPOService {

  constructor(private storage: Storage) {
  }

  private authHeader() {
    const token = this.storage.getCPOAuthToken();
    const authHeader = {
      "Content-Type": "application/json",
      "Authorization": `Token ${token}`
    };
    return authHeader;
  }

  async fetchEndpoints() {
    if (!this.storage.getCPOEndPoint('credentials')) {
      const cpoServer = this.storage.getCPOServer();

      let result = JSON.parse(await request({ headers: this.authHeader(), url: `${cpoServer}/ocpi/cpo/versions` }));
      const url = result.data.find(x => x.version === '2.1.1').url;

      const endPoints = {};
      result = JSON.parse(await request({ headers: this.authHeader(), url }));
      result.data.endpoints.forEach(element => {
        endPoints[element.identifier] = element.url;
      });

      this.storage.persistCPOEndPoints(endPoints);
    }
  }

  async register() {
    await this.fetchEndpoints();

    const emspServer = this.storage.getEMSPServer();

    const result = await request({
      url: this.storage.getCPOEndPoint('credentials'),
      headers: this.authHeader(),
      json: {
        "url": `${emspServer}/ocpi/emsp/versions`,
        "token": `${this.storage.getEMSPAuthToken()}`,
        "party_id": "S&C",
        "country_code": "DE",
        "business_details": {
          "name": "Share & Charge",
          "logo": {
            "url": "https://example.com/img/logo.jpg",
            "thumbnail": "https://example.com/img/logo_thumb.jpg",
            "category": "OPERATOR",
            "type": "jpeg",
            "width": 512,
            "height": 512
          },
          "website": "http://shareandcharge.com"
        }
      },
      method: "POST"
    });

    if (result.status_code != 1000) {
      console.log(result);
    }
  }

  async start() {
    await this.fetchEndpoints();

    const commands = this.storage.getCPOEndPoint('commands');
    const endpoint = `${commands}/START_SESSION`;
    const authId = "NL-VBR-00112233-TEST";

    const result = await request({
      headers: this.authHeader(),
      json: {
        response_url: `${this.storage.getEMSPServer()}/ocpi/emsp/2.1.1/commands/START_SESSION/${authId}`,
        token: {
          "auth_id": authId
        },
        location_id: "",
        evse_uid: "BB-5958-0"
      },
      method: "POST"
    });
    return result;
  }

  stop() {
  }

  async locations() {
    await this.fetchEndpoints();
    const locations = this.storage.getCPOEndPoint('locations');
    return JSON.parse(await request({
      headers: this.authHeader(),
      url: locations
    }));
  }

  async updateToken() {
    await this.fetchEndpoints();
    const tokens = this.storage.getCPOEndPoint('tokens');
    const emspToken = this.storage.getEMSPToken();

    // /ocpi/cpo/2.0/tokens/DE/SC2/emspToken
  }
}