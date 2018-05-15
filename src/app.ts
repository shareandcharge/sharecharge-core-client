import { CoreClient } from './coreClient';
import '@motionwerk/sharecharge-api';

const client = CoreClient.getInstance();
client.run();