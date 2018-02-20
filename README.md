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

#### Connecting a bridge

You can store bridges in the `src/bridges` directory.

```
git clone <bridge location> src/bridges/<bridge_name>
```

You should then configure the client to use your desired bridge (e.g. in `./config.ts`):
```ts
import { Bridge } from './src/bridges/path/to/bridge';
export const = {
    ...,
    bridge: new Bridge();
}
```

Bridges should implement the standard bridge interface:
```ts
interface BridgeInterface {
    status$: Observable<StatusObject>;
    health(): Promise<boolean>;
    connectorStatus(id?: string): Promise<boolean>;
    start(parameters: any): Promise<Result>;
    stop(parameters: any): Promise<Result>;
    startUpdater(interval?: number): void;
    stopUpdater(): void;
}
```

#### Configuration

Define a `config.ts` file to inject as a dependency when instantiating the Core Client class:


```ts
import { Bridge } from '.src/bridges/myBridge';

export const config = {
    test: false,
    bridge: new Bridge(),
    statusUpdateInterval: 5000
}
```

Default values exist:
- test is false
- bridge is configured to use a mock bridge implementation
- statusUpdateInterval will default to 5 minutes


## Starting the core client:

The environment variables `ID` and `PASS` are necessary for the core client to function properly. The ID is used to filter events on connectors managed by the client and the PASS of the client's wallet connected to the client is needed to confirm requests via smart contracts. This may not be needed in the case of local development where the wallet password is simply an empty string.
```
ID=0x01234 PASS=123 npm run client
```

Command Line Interface
----------------------

To install the cli you have to use

```
npm link
```

Usage:

```
ID=0x0123 PASS=123 sc cp --help
Usage: sc cp <command> [options]

Commands:
  sc.ts cp status [id]   Returns the current status of the Charge Point with
                         given id
  sc.ts cp disable [id]  Disables the Charge Point with given id
  sc.ts cp enable [id]   Enables the Charge Point with given id
  sc.ts cp deploy [id]   Deploys the Charge Point with given id

Options:
  --json         generate json output
  -v, --version  Show version number                                   [boolean]
  -h, --help     Show help                                             [boolean]

```

```
ID=0x0123 PASS=123 sc bridge --help
Usage: sc bridge <command> [options]

Commands:
  sc.ts bridge status  Returns the current status of the configured Bridge

Options:
  --json         generate json output
  -v, --version  Show version number                                   [boolean]
  -h, --help     Show help                                             [boolean]
```

Example:
```
ID=0x0123 PASS=123 sc cp status 0x12
```

**NOTE**: ~~Modbus does not appear to support simultaneous connections. If the core client is running, it is not possible to retrieve the charge point's status via the IoT Bridge from the shell.~~ Could not reproduce! 

### Coming Soon:
- docker setup