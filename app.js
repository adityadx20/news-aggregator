require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

const userRoutes = require('./routes/userRoutes');
const newsRoutes = require('./routes/newsRoutes');

const GNEWS_KEY = process.env.GNEWS_API_KEY;
const MONGODB_URI = process.env.MONGODB_URI;

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const newsCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

// MongoDB connection
mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('MongoDB connection failed:', error);
    });

// Routes
app.use('/users', userRoutes);
app.use(
    '/',
    newsRoutes(newsCache, CACHE_DURATION, GNEWS_KEY)
);

app.listen(port, (err) => {
    if (err) {
        return console.log('Something bad happened', err);
    }

    console.log(`Server is listening on ${port}`);
});

module.exports = app;