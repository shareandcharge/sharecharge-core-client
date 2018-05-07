import * as config from 'config';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import ocpi from '../../api/routes/ocpi/emsp';

const app = express();

app.use(bodyParser.json()); // support json bodies
app.use(bodyParser.urlencoded({ extended: true }));  //support encoded bodies

app.use('/health', (req, res) => res.send('OK'));
app.use('/ocpi', ocpi);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    app.emit('started');
    console.log('API server running on port:' + port);
});

export default app;