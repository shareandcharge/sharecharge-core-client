import { ShareCharge, Wallet, Station, ToolKit, OpeningHours, Evse } from '@motionwerk/sharecharge-lib';
import * as express from 'express';
import authenticate from '../middleware/authenticate';

const router = express.Router();

export default (sc: ShareCharge, wallet: Wallet) => {

    // get all stations
    router.get('/', authenticate, async (req, res) => {
        const stations = await sc.stations.getAll();
        res.send(stations.map((station: Station) => Station.serialize(station)));
    });

    // get single station
    router.get('/:id', authenticate, async (req, res) => {
        const station = await sc.stations.getById(req.params.id);
        res.send(Station.serialize(station));
    });

    // create station
    router.post('/', authenticate, async (req, res) => {
        const station = new Station();
        station.latitude = req.body.latitude;
        station.longitude = req.body.longitude;
        station.openingHours = new OpeningHours();
        await sc.stations.useWallet(wallet).create(station);
        res.send(station.id);
    });

    return router;
};