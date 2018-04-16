import { ShareCharge, Wallet } from '@motionwerk/sharecharge-lib';
import ICDR from '../../models/iCDR';
import authenticate from '../middleware/authenticate';
import * as express from 'express';

const router = express.Router();

export default (sc: ShareCharge, wallet: Wallet) => {

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

    router.put('/start/:id', authenticate, async (req, res) => {
        const evse = await sc.evses.getById(req.params.id);
        await sc.charging.useWallet(wallet).requestStart(evse, 1, 1);
        res.sendStatus(200);
    });

    router.put('/stop/:id', authenticate, async (req, res) => {
        const evse = await sc.evses.getById(req.params.id);
        await sc.charging.useWallet(wallet).requestStop(evse);
        res.sendStatus(200);
    });

    return router;
}