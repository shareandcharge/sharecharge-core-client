import * as config from 'config';
import * as express from 'express';

const router = express.Router();

const serverURL = config.get('emspServer');

router.get('/', (req, res) => {
  res.send({
    data: {
      version: "2.1.1",
      endpoints: [
        {
          identifier: "credentials",
          url: `${serverURL}/ocpi/emsp/2.1.1/credentials/`
        },
        {
          identifier: "locations",
          url: `${serverURL}/ocpi/emsp/2.1.1/locations/`
        },
        {
          identifier: "sessions",
          url: `${serverURL}/ocpi/emsp/2.1.1/sessions/`
        },
        {
          identifier: "cdrs",
          url: `${serverURL}/ocpi/emsp/2.1.1/cdrs/`
        },
        {
          identifier: "tariffs",
          url: `${serverURL}/ocpi/emsp/2.1.1/tariffs/`
        },
        {
          identifier: "tokens",
          url: `${serverURL}/ocpi/emsp/2.1.1/tokens/`
        },
        {
          identifier: "commands",
          url: `${serverURL}/ocpi/emsp/2.1.1/commands/`
        }
      ]
    },
    status_code: 1000,
    status_message: "Success",
    timestamp: new Date()
  });
});

export default router;