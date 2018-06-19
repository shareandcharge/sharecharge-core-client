# Share & Charge Core Client

The Core Client is used by Charge Point Operators and private Charge Point Owners to manage charge sessions on the Share & Charge e-Mobility Network.

## Quickstart

Install via NPM:

```
npm install -g @motionwerk/sharecharge-core-client
```

Run:

```
scc
```

You will need to provide the correct `stage` and `ethProvider` in your config (see below). By default the bridge points to locally deployed contracts (e.g. using `ganache-cli`). 

#### Configuration

A `config.json` is provided with default configuration values in the root directory (`$HOME/.sharecharge/`).

```
{
  "locationsPath": "locations.json",
  "tariffsPath": "tariffs.json",
  "bridgePath": "@motionwerk/sharecharge-example-bridge",
  "seed": "filter march urge naive sauce distance under copy payment slow just warm",
  "stage": "local",
  "gasPrice": 2,
  "ethProvider": "http://localhost:8545",
  "ipfsProvider": {
    "host": "ipfs.infura.io",
    "port": "5001",
    "protocol": "https"
  }
}
```

#### Connecting a bridge

Bridges must implement the [`IBridge`](https://github.com/motionwerkGmbH/sharecharge-core-client/blob/develop/src/interfaces/iBridge.ts) interface.

An example bridge is provided for testing purposes and includes an autostop after 10 seconds.
