import { ShareCharge, Wallet, Station, ToolKit, OpeningHours, Evse } from '@motionwerk/sharecharge-lib';
import * as jwt from 'jsonwebtoken';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import LoggingProvider from "../services/loggingProvider";
import ICDR from '../models/iCDR';

const logger = new LoggingProvider().obtain();
const app = express();
const PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
    logger.info('API server running on http://localhost:' + PORT);
});

export const config = {
    stage: process.env.sc_stage || "local",
    provider: process.env.sc_provider || 'http://localhost:8545',
    gasPrice: 18000000000
};

const sc = ShareCharge.getInstance();
const wallet = new Wallet('filter march urge naive sauce distance under copy payment slow just cool');

sc.startListening();
sc.on('StationCreated', result => {
    console.log(result);
});
sc.on('StationUpdated', result => {
    console.log(result);
});
sc.on('EvseCreated', result => {
    console.log(result);
});
sc.on('EvseUpdated', result => {
    console.log(result);
});
sc.on('StartRequested', result => {
    // if result.evseId is one of ours since this will receive ALL messages
    // simulate delay of starting evse
    setTimeout(async () => {
        const evse = await sc.evses.getById(result.evseId);
        sc.charging.useWallet(wallet).confirmStart(evse);
    }, 500);
});
sc.on('StopRequested', result => {
    // if result.evseId is one of ours since this will receive ALL messages
    // simulate delay of starting evse
    setTimeout(async () => {
        const evse = await sc.evses.getById(result.evseId);
        // use bridge to stop then get cdr
        // await bridge.stop(id);
        const cdr: ICDR = { start: Date.now() - 60000, stop: Date.now(), energy: 10000 };
        sc.charging.useWallet(wallet).confirmStop(evse, cdr.start, cdr.stop, cdr.energy);
    }, 500);
});
sc.on('Error', result => {
    console.log("Error", result);
});

let to;

app.use(bodyParser.json()); // support json bodies
app.use(bodyParser.urlencoded({extended: true}));  //support encoded bodies

// export const listen = () => {
//     app.listen(PORT, function () {
//         logger.info('API server running on http://localhost:' + PORT);
//     });

//     // CREATING JW TOKEN
//     jwt.sign({user: 'test'}, 'secretkey', {expiresIn: '2m'}, (err, token) => {
//         if (err) {
//             logger.info(err);
//         } else {
//             logger.info("Your json web token: ", token);
//         }
//     });
// };

// create station
app.post('/api/stations', verifyToken, async (req, res) => {
    const station = new Station();
    station.latitude = req.body.latitude;
    station.longitude = req.body.longitude;
    station.openingHours = new OpeningHours();
    await sc.stations.useWallet(wallet).create(station);
    res.send(station.id);
});

// get all stations
app.get('/api/stations', verifyToken, async (req, res) => {
    const stations = await sc.stations.getAll();
    res.send(stations.map((station: Station) => Station.serialize(station)));
});

// get single station
app.get('/api/stations/:id', verifyToken, async (req, res) => {
    const station = await sc.stations.getById(req.params.id);
    res.send(Station.serialize(station));
});


// create evse
app.post('/api/evse', verifyToken, async (req, res) => {
    const evse = new Evse();

    evse.stationId = req.body.stationId;
    evse.currency = req.body.currency;
    evse.basePrice = req.body.basePrice;
    evse.tariffId = req.body.tariffId;
    evse.available = req.body.available;

    await sc.evses.useWallet(wallet).create(evse);
    res.send(evse.id);
});

// get informations for one evse
app.get('/api/evse/:id', verifyToken, async (req, res) => {

    const evse = await sc.evses.getById(req.params.id);
    const station = await sc.stations.getById(evse.stationId);

    let response = {
        id: evse.id,
        stationId: evse.stationId,
        owner: evse.owner,
        basePrice: evse.basePrice,
        currency: evse.currency,
        tariffId: evse.tariffId,
        available: evse.available
    }
    res.send(response);
});

//Disable the evse
app.put('/api/disable/:id', verifyToken, async (req, res) => {

    const evse = await sc.evses.getById(req.params.id);
    evse.available = false;
    await sc.evses.useWallet(wallet).update(evse);
    res.sendStatus(200);
});

//Enable the evse
app.put('/api/enable/:id', verifyToken, async (req, res) => {
    const evse = await sc.evses.getById(req.params.id);
    evse.available = true;
    await sc.evses.useWallet(wallet).update(evse);
    res.sendStatus(200);
});

//Request start
app.put('/api/start/:id', verifyToken, async (req, res) => {
    const evse = await sc.evses.getById(req.params.id);
    // await sc.charging.useWallet(wallet).requestStart(connector, 10);
    res.send(200);
});

// Stop endpoint -0
app.put('/api/stop/:id', verifyToken, async (req, res) => {
    const evse = await sc.evses.getById(req.params.id);
    await sc.charging.useWallet(wallet).requestStop(evse);
    // clearTimeout(to);
    // const stop = await contract.sendTx('confirmStop', req.params.id);
    // console.log("Charging stoped");
    // res.send(stop);
    res.send(200);
});

// CREATING JW TOKEN
// jwt.sign({user: 'test'}, 'secretkey', {expiresIn: '20m'}, (err, token) => {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log("Your json web token: ", token);
//     }
// });

// Verify Token
function verifyToken(req, res, next) {
    // const bearerHeader = req.headers['authorization'];

    // if (typeof bearerHeader === 'undefined') {
    //     res.sendStatus(403);
    // }
    // const bearer = bearerHeader.split(' ');
    // const bearerToken = bearer[1];
    // req.token = bearerToken;

    // jwt.verify(bearerToken, 'secretkey', (err, authData) => {
    //     if (err) {
    //         res.sendStatus(403);
    //     } else {
    next();
    //     }
    // });
}
