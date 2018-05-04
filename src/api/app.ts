import { ShareCharge, Wallet } from '@motionwerk/sharecharge-lib';
import * as config from 'config';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import "reflect-metadata";
import LoggingProvider from "../services/loggingProvider";
import evses from  './routes/evses';
import stations from  './routes/stations';
import charging from  './routes/charging';
import auth from './routes/auth';
import ocpi from './routes/ocpi/emsp';

const logger = new LoggingProvider().obtain();
const app = express();

const sc = ShareCharge.getInstance({
    stage: config.get("stage"),
    provider: config.get("provider"),
    gasPrice: parseInt(config.get("gasPrice"))
});
sc.startListening();

sc.on('Error', result => {
    logger.error("Error", result);
});

const wallet = new Wallet('filter march urge naive sauce distance under copy payment slow just cool');

app.use(bodyParser.json()); // support json bodies
app.use(bodyParser.urlencoded({extended: true}));  //support encoded bodies

app.use('/health', (req, res) => res.send('OK'));
app.use('/ocpi', ocpi);

app.use('/api/evses', evses(sc, wallet));
app.use('/api/stations', stations(sc, wallet));
app.use('/api/charging', charging(sc, wallet));
app.use('/api/auth', auth);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    process.send({ msg: "started", args: ""});
    logger.info('API server running on http://localhost:' + port);
});
