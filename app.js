const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./middleware/auth');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const GNEWS_KEY = process.env.GNEWS_API_KEY;

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const users = [];

const newsCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;


app.post('/users/signup', async (req, res) => {

    const { name, email, password, preferences } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            error: 'Name, email, password are required'
        });
    }

    const existingUser = users.find((user) => user.email === email);

    if (existingUser) {
        return res.status(409).json({
            error: 'Email already registered'
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
        name,
        email,
        password: hashedPassword,
        preferences: preferences || []
    };

    users.push(user);

    return res.status(200).json({
        message: 'User created successfully'
    });
});


app.post('/users/login', async (req, res) => {

    const { email, password } = req.body;

    const user = users.find((user) => user.email === email);

    if (!user) {
        return res.status(401).json({
            error: 'Invalid email or password'
        });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        return res.status(401).json({
            error: 'Invalid email or password'
        });
    }

    const token = jwt.sign(
        {
            email: user.email
        },
        JWT_SECRET,
        {
            expiresIn: '1h'
        }
    );

    return res.status(200).json({
        token
    });
});


app.get('/users/preferences', authenticateToken, (req, res) => {

    const user = users.find((user) => user.email === req.user.email);

    if (!user) {
        return res.status(401).json({
            error: 'User not found'
        });
    }

    return res.status(200).json({
        preferences: user.preferences
    });
});


app.put('/users/preferences', authenticateToken, (req, res) => {

    const { preferences } = req.body;

    const user = users.find((user) => user.email === req.user.email);

    if (!user) {
        return res.status(401).json({
            error: 'User not found'
        });
    }

    user.preferences = preferences;

    return res.status(200).json({
        message: 'Preferences updated successfully'
    });
});


app.get('/news', authenticateToken, async (req, res) => {

    const user = users.find((user) => user.email === req.user.email);

    if (!user) {
        return res.status(401).json({
            error: 'User not found'
        });
    }

    const preferences = user.preferences;

    const cacheKey = preferences
        .slice()
        .sort()
        .join('|');

    const cachedData = newsCache.get(cacheKey);

    if (
        cachedData &&
        Date.now() - cachedData.timestamp < CACHE_DURATION
    ) {
        return res.status(200).json({
            news: cachedData.news
        });
    }

    try {

        const query = preferences.join(' OR ');

        const params = new URLSearchParams({
            q: query,
            lang: 'en',
            country: 'in',
            max: '10',
            sortby: 'publishedAt',
            apikey: GNEWS_KEY
        });

        const response = await fetch(
            `https://gnews.io/api/v4/search?${params}`
        );

        if (!response.ok) {

            const errorData = await response.json();

            throw new Error(
                `GNews API error: ${response.status} - ${JSON.stringify(errorData)}`
            );
        }

        const data = await response.json();

        const news = data.articles;

        newsCache.set(cacheKey, {
            news,
            timestamp: Date.now()
        });

        return res.status(200).json({
            news
        });

    } catch (error) {

        return res.status(500).json({
            error: 'Failed to fetch news'
        });
    }
});

app.listen(port, (err) => {
    if (err) {
        return console.log('Something bad happened', err);
    }
    console.log(`Server is listening on ${port}`);
});

module.exports = app;