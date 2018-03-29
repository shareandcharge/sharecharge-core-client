# Share & Charge Core Client

The Share & Charge Core Client used by Charge Point Operators and Private Chare Point Owners to connect their charging points to the Share & Charge network.

## Development

#### Setup Client with the Core Client Library

```
git clone git@github.com:motionwerkGmbH/sharecharge-core-client.git
cd sharecharge-core-client
git clone git@github.com:motionwerkGmbH/sharecharge-core-client-lib.git lib
cd src/lib
npm install
cd -
```

#### Connecting a bridge

You can store bridges in the `src/bridges` directory.

```
git clone <bridge location> src/bridges/<bridge_name>
```

You can then point the S&C CLI to the path of the bridge entry point in the configuration (see section below). 

Note that the CLI will expect a default class export.  


#### Configuration

A `config.yaml` is provided with default configuration values in the root directory. A TOML file can also be used if preferred. 

```
--- 
  bridge: ./testBridge1
  statusInterval: 2000
  evse: ./evses.json
  test: true
  id: 123
  pass: 123
```


## Command Line Interface:

To install the cli you have to use

```
npm link
```

Charge Point on EV Network Subcommand Usage:

```
Usage: sc cp <command> [options]

Commands:
  sc.ts cp status [id]           Returns the current status of the Charge Point
                                 with given id
  sc.ts cp disable [id]          Disables the Charge Point with given id
  sc.ts cp enable [id]           Enables the Charge Point with given id
  sc.ts cp register [id]         Registers a Charge Point with given id in the
                                 EV Network
  sc.ts cp start [id] [seconds]  Start a charging session at a given Charge
                                 Point

Options:
  --json         generate json output
  -v, --version  Show version number                                   [boolean]
  -h, --help     Show help                                             [boolean]
```

Example:
```
$ sc cp register 0x01
Registering CP with id: 0x01 for client: 0x09
Success: true
Tx: 0xc55409b655a829f1b5d7631f9dde219538c9fbf60c347bf222e0f82cc19fb2b3
Block: 156334
$ sc cp start 0x01
Starting charge on 0x01 for 10 seconds...
Start request by 0xf2035405c983638c6d560d43ce199240f6bf135d included in block 156362
Start confirmation included in block 156364
Charging [================================================================================] 10s
Stop confirmation included in block 156376
```

Charge Point on Bridge Subcommand Usage 

```
sc bridge --help
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
sc cp status 0x12
```

