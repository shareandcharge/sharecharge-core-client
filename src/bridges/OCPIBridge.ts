import * as config from 'config';
import * as request from 'request-promise';

const tokenA = config.get('cpoToken');
const cpoServer = config.get('cpoServer');
const emspServer = config.get('emspServer');
const emspToken = config.get('emspToken');

const authHeader = {
  "Content-Type": "application/json",
  "Authorization": `Token ${tokenA}`
};

export default class OCPIBridge {

  private endPoints = new Map<string, string>();

  async register() {
    let result = JSON.parse(await request({ headers: authHeader, url: `${cpoServer}/ocpi/cpo/versions` }));
    const url = result.data.find(x => x.version === '2.1.1').url;

    result = JSON.parse(await request({ headers: authHeader, url }));
    result.data.endpoints.forEach(element => {
      this.endPoints.set(element.identifier, element.url);
    });

    result = await request({
      url: this.endPoints.get('credentials') || '',
      headers: authHeader,
      json: {
        "url": `${emspServer}/ocpi/emsp/versions`,
        "token": `${emspToken}`,
        "party_id": "BMW",
        "country_code": "DE",
        "business_details": {
          "name": "Share & Charge",
          "website": "http://shareandcharge.com"
        }
      },
      method: "POST"
    });

    console.log(result);

  }

  start(parameters: any) {
    const endpoint = 'https://serviceqa.eoperate-portal.com/ocpi/cpo/2.1.1/commands/START_SESSION';
    const body = {
      response_url: 'http://localhost:3000/ocpi/emsp/2.1.1/commands/START_SESSION/NL-VBR-00112233-TEST',
      token: {
        "auth_id": "NL-VBR-00112233-TEST"
      },
      location_id: "4711",
      evse_uid: "DE*ISE*1234*5"
    };

    request.post(endpoint, { json: body }, (error, response, body) => {
      if (error || response.statusCode == 200) {

      }
    });
  }
};
