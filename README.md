# Share & Charge Core Client

The Core Client is used by Charge Point Operators and private Charge Point Owners to manage charge sessions on the Share & Charge e-Mobility Network.
It directly listens to Share & Charge smart contract events and filters based on EVSEs connected to a wallet configured by the user.  

## Quickstart

Install via NPM:
```
npm install -g @motionwerk/sharecharge-core-client
```

A default configuration file will be generated in `$HOME/.sharecharge/`. It is important to configure the Core Client to listen on a particular `stage` and `ethProvider` so that the correct contracts are used. Additionally, a funded wallet is necessary to add charge points to the network. These charge points will be filtered automatically by the Core Client, based on the provided wallet `seed` in the configuration file.

Running the `init` command will setup the Core Client to listen to the S&C pilot network.
```
sc-cc init
```

The wallet can be created and charge points added by using the Share & Charge command line interface:
```
npm install -g @motionwerk/sharecharge-cli
```

Create a wallet and follow the instructions to use:
```
sc-cli wallet create
```

Add charge points to the network:
```
sc-cli store add-locations
```

Add tariffs to the network:
```
sc-cli store add-tariffs
```

Finally, you can run the Core Client using:
```
sc-cc
```

If all has been correctly configured you will be presented with the wallet's coinbase (primary address) and charge points upon start. 

#### Connecting a bridge

Bridges must implement the [`IBridge`](https://github.com/motionwerkGmbH/sharecharge-core-client/blob/develop/src/interfaces/iBridge.ts) interface.

An example bridge is provided for testing purposes and includes an autostop after 10 seconds.
