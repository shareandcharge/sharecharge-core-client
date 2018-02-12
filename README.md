# Share & Charge Core Client

The Share & Charge Core Client used by Charge Point Operators and Private Chare Point Owners to connect their charging points to the Share & Charge network.

## Development

#### Providing the Core Client Library

```
git clone git@github.com:motionwerkGmbH/sharecharge-core-client-lib.git src/lib
```

#### Providing Plugins

```
git clone <plugin location> src/plugins/<plugin_name>
```

#### Configuration

Define a `config.ts` file to inject as a dependency when instantiating the Core Client class:

```ts
import { MyPlugin } from './path/to/plugin';

export const config = {
    plugin: new MyPlugin();
}
```

Use as follows:

```ts
import { config } from './path/to/config';
import { Client } from './path/to/client';

const client = new Client(config);
// client.pluginName === MyPlugin
```