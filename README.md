# Share & Charge Core Client

The Share & Charge Core Client used by Charge Point Operators and Private Chare Point Owners to connect their charging points to the Share & Charge network.

## Development

#### Setup Client with the Core Client Library

```
git clone git@github.com:motionwerkGmbH/sharecharge-core-client.git
cd sharecharge-core-client
git clone git@github.com:motionwerkGmbH/sharecharge-core-client-lib.git src/lib
cd src/lib
npm install
cd -
```

#### Providing Bridge

You can store bridges in the `src/bridges` directory.

```
git clone <bridge location> src/bridges/<bridge_name>
```

#### Configuration

Define a `config.ts` file to inject as a dependency when instantiating the Core Client class:

If no bridge is specified, a default test bridge is provided.

```ts
import { MyBridge } from '.src/bridges/myBridge';

export const config = {
    bridge: new MyBridge();
}
```

Use as follows:

```ts
import { config } from './config';
import { Client } from './src/index';

const client = new Client(config);
client.start();
// client.bridgeName === 'myBridge'
```

## Starting the core client:

The environment variables `ID` and `PASS` are necessary for the core client to function properly. The ID is used to filter events on connectors managed by the client and the PASS of the client's wallet connected to the client is needed to confirm requests via smart contracts. This may not be needed in the case of local development where the wallet password is simply an empty string.
```
ID=0x01234 PASS=123 npm run client
```

### Coming Soon:
- docker setup