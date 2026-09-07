const express = require('express');
const {fetchNews,searchNews,findCachedArticle} = require('../services/newsService');

const User = require('../models/User');
const authenticateToken = require('../authorization/auth');

module.exports = (newsCache, CACHE_DURATION, GNEWS_KEY) => {

    const router = express.Router();

    const findArticleForUser = (articleId) => {

    return findCachedArticle(
        newsCache,
        articleId
    );
    };


    // Get personalized news
    router.get('/news', authenticateToken, async (req, res) => {

        try {

            const user = await User.findOne({
                email: req.user.email
            });

            if (!user) {
                return res.status(401).json({
                    error: 'User not found'
                });
            }

            if (
                !Array.isArray(user.preferences) ||
                user.preferences.length === 0
            ) {
                return res.status(400).json({
                    error: 'At least one news preference is required'
                });
            }

            const news = await fetchNews(
                user.preferences,
                newsCache,
                CACHE_DURATION,
                GNEWS_KEY
            );

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

            console.error('Get news error:', error);

            return res.status(500).json({
                error: 'Failed to fetch news'
            });
        }
    });


    // Mark news article as read
    router.post('/news/:id/read', authenticateToken, async (req, res) => {

        try {

            const user = await User.findOne({
                email: req.user.email
            });

            if (!user) {
                return res.status(401).json({
                    error: 'User not found'
                });
            }

            const articleId = req.params.id;

            const article = findArticleForUser(articleId);

            if (!article) {
                return res.status(404).json({
                    error: 'News article not found'
                });
            }

            if (
                !user.readArticles.some(
                    (article) => article.id === articleId
                )
            ) {
                user.readArticles.push(article);

                await user.save();
            }

            return res.status(200).json({
                message: 'Article marked as read'
            });

        } catch (error) {

            console.error('Mark article as read error:', error);

            return res.status(500).json({
                error: 'Failed to process article'
            });
        }
    });


    // Mark news article as favorite
    router.post('/news/:id/favorite', authenticateToken, async (req, res) => {

        try {

            const user = await User.findOne({
                email: req.user.email
            });

            if (!user) {
                return res.status(401).json({
                    error: 'User not found'
                });
            }

            const articleId = req.params.id;

            const article = findArticleForUser(articleId);

            if (!article) {
                return res.status(404).json({
                    error: 'News article not found'
                });
            }

            if (
                !user.favoriteArticles.some(
                    (article) => article.id === articleId
                )
            ) {
                user.favoriteArticles.push(article);

                await user.save();
            }

            return res.status(200).json({
                message: 'Article marked as favorite'
            });

        } catch (error) {

            console.error('Mark article as favorite error:', error);

            return res.status(500).json({
                error: 'Failed to process article'
            });
        }
    });


    // Get all read news articles
    router.get('/news/read', authenticateToken, async (req, res) => {

        try {

            const user = await User.findOne({
                email: req.user.email
            });

            if (!user) {
                return res.status(401).json({
                    error: 'User not found'
                });
            }

            return res.status(200).json({
                news: user.readArticles
            });

        } catch (error) {

            console.error('Get read articles error:', error);

            return res.status(500).json({
                error: 'Failed to get read articles'
            });
        }
    });


    // Get all favorite news articles
    router.get('/news/favorites', authenticateToken, async (req, res) => {

        try {

            const user = await User.findOne({
                email: req.user.email
            });

            if (!user) {
                return res.status(401).json({
                    error: 'User not found'
                });
            }

            return res.status(200).json({
                news: user.favoriteArticles
            });

        } catch (error) {

            console.error('Get favorite articles error:', error);

            return res.status(500).json({
                error: 'Failed to get favorite articles'
            });
        }
    });


    // Search news articles
    router.get('/news/search/:keyword', authenticateToken, async (req, res) => {

        const keyword = req.params.keyword.trim();

        if (!keyword) {
            return res.status(400).json({
                error: 'Search keyword is required'
            });
        }

        try {

            const news = await searchNews(
                keyword,
                newsCache,
                CACHE_DURATION,
                GNEWS_KEY
            );

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

            console.error('Search news error:', error);

            return res.status(500).json({
                error: 'Failed to search news'
            });
        }
    });


    return router;
};