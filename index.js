const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const responseTime = require('response-time');
const compression = require('compression');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(responseTime());
app.use(compression());

app.set('views', `${__dirname}/views`);
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public'), { maxage: '14d' }));

const HomeController = require('./controllers/HomeController');
const UtilitiesController = require('./controllers/UtilitiesController');

app.post('/mcsubscribe', UtilitiesController.MCSubscribe);
app.get('/tour2017', HomeController.SongkickEmbed);
app.get('/stems', HomeController.Stems);
app.get('/:param?', HomeController.Index);

exports.app = app;
