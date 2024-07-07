/***********************************************************************
************ Author:    Christian KEMGANG NGUESSOP *********************
************ Version:    1.0.0                      ********************
***********************************************************************/

const express = require('express');
const app = express();
require("dotenv/config");
const path = require('path');
const morgan = require('morgan');
const mongoose = require('mongoose');
const connectWithRetry = require('./src/config/dbConn'); // DB connection
const { logger } = require('./src/middleware/logger');
const authJwt = require('./src/helpers/expressJwt');
const errorHandler = require('./src/helpers/errorHandler');

const port = process.env.PORT || 5000;
const api = process.env.API_URL;

// Get all the routes
const authRoutes = require('./src/routes/authRoute');
const userRoutes = require('./src/routes/userRoute');
const categoryRoutes = require('./src/routes/categoryRoute');
const productRoutes = require('./src/routes/productRoute');

// Middleware to analyse JSON request bodies
app.use(express.json());
app.use(morgan('tiny'));
app.use(authJwt()); // Protect an api
app.use(errorHandler); // Error handler

app.use(logger);

connectWithRetry();

app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/', require('./src/routes/root'));

app.use(`${api}/auth`, authRoutes);
app.use(`${api}/users`, userRoutes);
app.use(`${api}/categories`, categoryRoutes);
app.use(`${api}/products`, productRoutes);

app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, './src/views', 'error404.html'));
    } else if (req.accepts('json')) {
        res.json({ message: '404 Not Found' });
    } else {
        res.type('txt').send('404 Not Found');
    }
});

app.listen(port, () => {
    console.log('************************************'
        + `\n Server is running on the port ${port}` +
        '\n************************************');
});
