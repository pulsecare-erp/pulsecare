const express = require('express');
const session = require('express-session');
const app = express();
const port = 3000;

// Import Firebase admin and db from the config file
const { admin, db } = require('./config/firebase');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: 'your-secret-key-change-this',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.set('views', './views');
app.set('view engine', 'ejs');

// Import routes
const postRoute = require('./routes/post');
const getRoute = require('./routes/get');
app.use('/', postRoute);
app.use('/', getRoute);

app.listen(port, () => {
    console.log(`Server is running\n`);
});