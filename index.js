const express = require('express');
const app = express();
const port = 3000;

// Import Firebase admin and db from the config file
const { admin, db } = require('./config/firebase');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

// Import routes
const postRoute = require('./routes/post');
const getRoute = require('./routes/get');
app.use('/', postRoute);
app.use('/', getRoute);

app.listen(port, () => {
    console.log(`Server is running\n`);
});