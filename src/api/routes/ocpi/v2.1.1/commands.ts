import * as express from 'express';
const router = express.Router();

router.get('/START_SESSION/:unique', (req, res) => {
  res.sendStatus(200);
});

router.get('/STOP_SESSION/:unique', (req, res) => {
  res.sendStatus(200);
});

export default router;