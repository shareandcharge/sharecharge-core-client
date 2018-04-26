import * as express from 'express';
import * as config from 'config'
import versions from './v2.1.1/versions'
import credentials from './v2.1.1/credentials';
import locations from './v2.1.1/locations';
import sessions from './v2.1.1/sessions';
import cdrs from './v2.1.1/cdrs';
import tariffs from './v2.1.1/tariffs';
import tokens from './v2.1.1/tokens';
import commands from './v2.1.1/commands';

const router = express.Router();
const serverURL = config.get('emspServer');

router.get('/emsp/versions', (req, res) => {
  res.send({
      data: {
          version: "2.1.1",
          url: `${serverURL}/ocpi/emsp/2.1.1`
      },
      status_code: 1000,
      status_message: "Success",
      timestamp: new Date()
  });
});

router.use('/emsp/2.1.1/', versions);
router.use('/emsp/2.1.1/credentials/', credentials);
router.use('/emsp/2.1.1/locations/', locations);
router.use('/emsp/2.1.1/sessions/', sessions);
router.use('/emsp/2.1.1/cdrs/', cdrs);
router.use('/emsp/2.1.1/tariffs/', tariffs);
router.use('/emsp/2.1.1/tokens/', tokens);
router.use('/emsp/2.1.1/commands/', commands);

export default router;