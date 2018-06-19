# Share & Charge Core Client

The Core Client is used by Charge Point Operators and Private Charge Point Owners to manage charge sessions on the Share & Charge e-Mobility Network.

## Setup

```
npm install -g @motionwerk/sharecharge-core-client
```



## Development

```
git clone git@github.com:motionwerkGmbH/sharecharge-core-client.git
cd sharecharge-core-client
npm install
```

#### Connecting a bridge

A path to a default bridge class can be included in the configuration file (as below). This class should implement the [`IBridge`](https://github.com/motionwerkGmbH/sharecharge-core-client/blob/develop/src/interfaces/iBridge.ts) interface.

A MockBridge is provided for testing purposes and includes an autostop after 10 seconds.


#### Configuration

A `config.yaml` is provided with default configuration values in the root directory. A TOML file can also be used if preferred. 

```
--- 
  bridgePath: ../bridges/MockBridge
  stage: "local"
  ethProvider: "http://localhost:8545"
  seed: "filter march urge naive sauce distance under copy payment slow just warm"
  gasPrice: 2
  
```

##### Running the Client

```
npm start
```