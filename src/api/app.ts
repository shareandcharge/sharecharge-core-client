import { ShareAndCharge } from '../lib/src/shareAndCharge';
import { Contract } from '../lib/src/services/contract'
import { IContract } from '../lib/src/models/contract';
import { initBridge } from '../sc/helper';
import * as jwt from 'jsonwebtoken';
import * as express from 'express';
import * as bodyParser from 'body-parser';

const bridge = initBridge('./conf.yaml');

const app = express();
const PORT = process.env.PORT || 3000;
let to;

const contract = new Contract('');

app.use(bodyParser.json()); // support json bodies
app.use(bodyParser.urlencoded({ extended: true }));  //support encoded bodies

app.listen(PORT, function(){
    console.log('Server is started on PORT:', PORT);
});

//CP
// Register connector
app.post('/register', verifyToken, async (req, res) => {
    jwt.verify(req.token, 'secretkey', async (err, authData) => {
        if(err){
            res.sendStatus(403);
        }else{
        
            let params = {
                id: req.body.id,
                client: req.body.client,
                owner: req.body.owner,
                lat: req.body.lat,
                lng: req.body.lng,
                price: req.body.price,
                model: req.body.model,
                plugType: req.body.plugType,
                openingHours: req.body.openingHours,
                isAvailable: req.body.isAvailable
            };
            const register = await contract.sendTx('registerConnector', params.id, params.client, params.owner, params.lat, params.lng, 
            params.price, params.model, params.plugType, params.openingHours, params.isAvailable );

            res.send(register);
            // console.log(register, ' register');
        }
    });
});

//Get status of the pole 
app.get('/status/:id', verifyToken, async (req, res) => {
  jwt.verify(req.token, 'secretkey', async(err, authData) => {
      if(err) {
          res.sendStatus(403);
        } else {
            let body = {
                "CP status ": await contract.queryState('isAvailable', req.params.id),
                "Bridge name ": bridge.name,
                "Bridge status ": await bridge.health()
            }
            res.send(body);
            // console.log(body);
        }
    });
});

//Disable the pole
app.put('/disable/:id', verifyToken,(req, res) => {
    jwt.verify(req.token, 'secretkey', async (err, authData) => {
        if(err){
            res.sendStatus(403);
        }else{
            const disable = await contract.sendTx('setAvailability', '0x09', req.params.id, false);
            res.send(disable);
            // console.log(disable);
        }
    });
});

//Enable the pole
app.put('/enable/:id', verifyToken, async (req, res) => {
    jwt.verify(req.token, 'secretkey', async (err, authData) => {
        if(err){
            res.sendStatus(403);
        }else{
            const enable = await contract.sendTx('setAvailability', '0x09', req.params.id, true);
            res.send(enable);
            // console.log(enable);
        }
    });
});

//Request start
app.put('/start/:id', verifyToken, async (req, res) => {
    jwt.verify(req.token, 'secretkey', async (err, authData) => {
        if(err){
            res.sendStatus(403);
        }else{
            const start = await contract.sendTx('requestStart', req.params.id, 10);
            if(start) {
                const charging = await contract.sendTx('confirmStart', req.params.id, '0x3d1C72e53cC9BDBd09371Fd173DD303D0DEa9A27');
                //hardcoded adress
                console.log("Charging...");

                to = setTimeout(async () => {
                    const stop = await contract.sendTx('confirmStop', req.params.id);
                    console.log("Charging Stoped");
                },10000);
            }
            res.send(start);
            // console.log(start);
        }
    });
});

// Stop endpoint
app.put('/stop/:id', verifyToken, async (req, res) => {
    jwt.verify(req.token, 'secretkey', async (err, authData) => {
        if(err){
            res.sendStatus(403);
        }else{
            clearTimeout(to);
            const stop = await contract.sendTx('confirmStop', req.params.id);
            console.log("Charging stoped");
            res.send(stop);
        }
    });
});

//BRIDGE
app.get('/bridge/status', verifyToken, async (req, res) => {
    jwt.verify(req.token, 'secretkey', async (err, authData) => {
        if(err){
            res.sendStatus(403);
        }else{
            let body = {
                "Bridge name ": bridge.name,
                "Bridge status ": await bridge.health()
            }
            res.send(body);
        }
    });
}); 

//CONFIGURATION
app.get('/config', verifyToken, (req, res) => {
    jwt.verify(req.token, 'secretkey', async(err, authData) => {
        if(err) {
            res.sendStatus(403);
          } else {
            console.log(PORT);
            const port = PORT;
            // res.send(port);
        }
    });
});

// CREATING JW TOKEN
jwt.sign({user: 'test'}, 'secretkey', { expiresIn: '2m' }, (err, token) => {
    if(err) {
        console.log(err);
    } else {
        console.log("Your json web token: ", token);
    }

});

// Verify Token
function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== 'undefined') {
      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];
      req.token = bearerToken;
      next();
    } else {
      res.sendStatus(403);
    }    
}