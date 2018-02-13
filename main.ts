import { config } from './config';
import { Client } from './src/index';

const client = new Client(config);
client.start();