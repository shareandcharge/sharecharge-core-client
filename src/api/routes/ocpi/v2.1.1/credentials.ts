import * as config from 'config';
import * as express from 'express';

const router = express.Router();

const emspServer = config.get('emspServer');
const emspToken = config.get('emspToken');

router.get('/', (req, res) => {
  res.send({
    data: {
      url: `${emspServer}/ocpi/emsp/versions`,
      token: `${emspToken}`,
      party_id: "BMW",
      country_code: "DE",
      business_details: {
        name: "Share & Charge",
        website: "http://shareandcharge.com"
      }
    }
  });
});

router.post('/', (req, res) => {
  console.log(req, res);
  req.app.emit('registered', { req, res });
  res.sendStatus(200);
});

export default router;