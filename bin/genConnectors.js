const fs = require('fs');
const crypto = require('crypto');

let data = {};

const quantity = 1000;

for (let i = 0; i < quantity; i++) {

    const id = '0x' + crypto.randomBytes(32).toString('hex');

    data[id] = {
        ownerName: "Share&Charge",
        client: '0x' + crypto.randomBytes(32).toString('hex'),
        lat: (Math.random() * 180).toFixed(6),
        lng: (Math.random() * 90).toFixed(6),
        price: Math.random() * 10,
        priceModel: Math.ceil(Math.random() * 2),
        plugType: Math.ceil(Math.random() * 6),
        openingHours: "0024002400240024002400240024",
        isAvailable: Math.floor(Math.random() * 2) ? false : true
    }
}

fs.writeFileSync('./connectorsXL.json', JSON.stringify(data, null, 2));