import { ShareCharge, Wallet, Station, ToolKit, OpeningHours, Evse } from 'sharecharge-lib';
import * as jwt from 'jsonwebtoken';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import LoggingProvider from "../services/loggingProvider";

const logger = new LoggingProvider().obtain();
const app = express();
const PORT = process.env.PORT || 3000;

const sc = ShareCharge.getInstance();
const wallet = new Wallet('filter march urge naive sauce distance under copy payment slow just cool');

sc.startListening();
sc.on('StationCreated', result => {
    console.log(result);
});
sc.on('StationUpdated', result => {
    console.log(result);
});
sc.on('ConnectorCreated', result => {
    console.log(result);
});
sc.on('ConnectorUpdated', result => {
    console.log(result);
});
sc.on('StartRequested', result => {
    // if result.connectorId is one of ours since this will receive ALL messages
    // simulate delay of starting connector
    setTimeout(async () => {
        const connector = await sc.evses.getById(result.connectorId);
        sc.charging.useWallet(wallet).confirmStart(connector, result.controller);
    }, 500);
});
sc.on('StopRequested', result => {
    // if result.connectorId is one of ours since this will receive ALL messages
    // simulate delay of starting connector
    setTimeout(async () => {
        const connector = await sc.evses.getById(result.connectorId);
        sc.charging.useWallet(wallet).confirmStop(connector, result.controller);
    }, 500);
});
sc.on('Error', result => {
    console.log("Error", result);
});

let to;

app.use(bodyParser.json()); // support json bodies
app.use(bodyParser.urlencoded({extended: true}));  //support encoded bodies

export const listen = () => {
    app.listen(PORT, function () {
        logger.info('API server running on http://localhost:' + PORT);
    });

    // CREATING JW TOKEN
    jwt.sign({user: 'test'}, 'secretkey', {expiresIn: '2m'}, (err, token) => {
        if (err) {
            logger.info(err);
        } else {
            logger.info("Your json web token: ", token);
        }
    });
};

// get all stations
app.get('/stations', verifyToken, async (req, res) => {
    const stations = await sc.stations.getAll();
    res.send(stations.map((station: Station) => Station.serialize(station)));
});

// get single station
app.get('/stations/:id', verifyToken, async (req, res) => {
    const station = await sc.stations.getById(req.params.id);
    res.send(Station.serialize(station));
});

// create station
app.post('/stations', verifyToken, async (req, res) => {
    const station = new Station();
    station.latitude = req.body.latitude;
    station.longitude = req.body.longitude;
    station.openingHours = new OpeningHours();
    await sc.stations.useWallet(wallet).create(station);
    res.send(station.id);
});

// create connector
app.post('/connectors', verifyToken, async (req, res) => {
    const connector = new Evse();
    connector.plugTypes = ToolKit.fromPlugMask(req.body.plugTypes);
    connector.available = true;
    await sc.evses.useWallet(wallet).create(connector);
    res.send(connector.id);
});

// get informations for one connector
app.get('/connectors/:id', verifyToken, async (req, res) => {

    const connector = await sc.evses.getById(req.params.id);
    const station = await sc.stations.getById(connector.stationId);

    let response = {
        lat: station.latitude,
        lng: station.longitude,
        price: 0,
        priceModel: 0,
        plugType: connector.plugTypes,
        openingHours: station.openingHours,
        isAvailable: connector.available
    }
    res.send(response);
});

//Get status of the connector
// app.get('/status/:id', async (req, res) => {
//     let body = {
//         "CP status ": (await sc.connectors.getById(req.params.id)).available,
//         "Bridge name ": bridge.name,
//         "Bridge status ": await bridge.health()
//     }
//     res.send(body);
// });

//Disable the connector
app.put('/disable/:id', verifyToken, async (req, res) => {
    const connector = await sc.evses.getById(req.params.id);
    connector.available = false;
    await sc.evses.useWallet(wallet).update(connector);
    res.sendStatus(200);
});

//Enable the connector
app.put('/enable/:id', verifyToken, async (req, res) => {
    const connector = await sc.evses.getById(req.params.id);
    connector.available = true;
    await sc.evses.useWallet(wallet).update(connector);
    res.sendStatus(200);
});

//Request start
app.put('/start/:id', verifyToken, async (req, res) => {
    const connector = await sc.evses.getById(req.params.id);
    await sc.charging.useWallet(wallet).requestStart(connector, 10);
    res.send(200);
});

// Stop endpoint
app.put('/stop/:id', verifyToken, async (req, res) => {
    const connector = await sc.evses.getById(req.params.id);
    await sc.charging.useWallet(wallet).requestStop(connector);
    // clearTimeout(to);
    // const stop = await contract.sendTx('confirmStop', req.params.id);
    // console.log("Charging stoped");
    // res.send(stop);
    res.send(200);
});

//BRIDGE
// app.get('/bridge/status', verifyToken, async (req, res) => {
//     let body = {
//         "Bridge name ": bridge.name,
//         "Bridge status ": await bridge.health()
//     }
//     res.send(body);
// });

//CONFIGURATION
app.get('/config', verifyToken, (req, res) => {
    jwt.verify(req.token, 'secretkey', async (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            logger.info(PORT.toString());
            const port = PORT;
            // res.send(port);
        }
    });
});

// CREATING JW TOKEN
jwt.sign({user: 'test'}, 'secretkey', {expiresIn: '20m'}, (err, token) => {
    if (err) {
        console.log(err);
    } else {
        console.log("Your json web token: ", token);
    }
});

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
