import { ShareCharge, Wallet, Station, ToolKit, OpeningHours, Evse } from '@motionwerk/sharecharge-lib';
import * as express from 'express';
import authenticate from '../middleware/authenticate';

const router = express.Router();

export default (sc: ShareCharge, wallet: Wallet) => {

    router.get('/:id', authenticate, async (req, res) => {
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

    router.post('/', authenticate, async (req, res) => {
        const evse = new Evse();

        evse.stationId = req.body.stationId;
        evse.currency = req.body.currency;
        evse.basePrice = req.body.basePrice;
        evse.tariffId = req.body.tariffId;
        evse.available = req.body.available;

        await sc.evses.useWallet(wallet).create(evse);
        res.send(evse.id);
    });

    router.put('/disable/:id', authenticate, async (req, res) => {
        const evse = await sc.evses.getById(req.params.id);
        evse.available = false;
        await sc.evses.useWallet(wallet).update(evse);
        res.status(200).send(evse);
    });

    router.put('/enable/:id', authenticate, async (req, res) => {
        const evse = await sc.evses.getById(req.params.id);
        evse.available = true;
        await sc.evses.useWallet(wallet).update(evse);
        res.status(200).send(evse);
    });

    return router;
}

