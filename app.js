require('dotenv').config();
const express = require('express');
const authenticateToken = require('./authorization/auth');
const userRoutes = require('./routes/userRoutes');
const newsRoutes = require('./routes/newsRoutes');


const GNEWS_KEY = process.env.GNEWS_API_KEY;

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const users = [];

app.use('/users', userRoutes(users));

const newsCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

app.use('/', newsRoutes(users, newsCache, CACHE_DURATION, GNEWS_KEY));


app.listen(port, (err) => {
    if (err) {
        return console.log('Something bad happened', err);
    }

    console.log(`Server is listening on ${port}`);
});

module.exports = app;