const express = require('express');
const fetchNews = require('../services/newsService');
const authenticateToken = require('../authorization/auth');

const router = express.Router();

module.exports = (users, newsCache, CACHE_DURATION, GNEWS_KEY) => {

    // News route 

    router.get('/news', authenticateToken, async (req, res) => {

    const user = users.find((user) => user.email === req.user.email);

    if (!user) {
        return res.status(401).json({
            error: 'User not found'
        });
    }

    if(!Array.isArray(user.preferences) || user.preferences.length === 0)
    {
        return res.status(400).json({
        error: 'At least one news preference is required'
        });
    }
      
    try {

        const news = await fetchNews(user.preferences,newsCache,CACHE_DURATION,GNEWS_KEY);

        return res.status(200).json({
            news
        });

    } catch (error) {

        if (error.status === 429) {
            return res.status(429).json({
                error: 'News service rate limit exceeded'
            });
        }

        if (error.status === 401) {
            return res.status(502).json({
                error: 'News service authentication failed'
            });
        }

        if (error.status === 403) {
            return res.status(502).json({
                error: 'News service access denied'
            });
        }

        return res.status(500).json({
            error: 'Failed to fetch news'
        });
    }

    });

    return router;
};