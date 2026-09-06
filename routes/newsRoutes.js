const express = require('express');
const {fetchNews,searchNews} = require('../services/newsService');
const authenticateToken = require('../authorization/auth');

const router = express.Router();


// Find an article for a user
const findArticleForUser = async (
    user,
    articleId,
    newsCache,
    CACHE_DURATION,
    GNEWS_KEY
) => {

    const news = await fetchNews(
        user.preferences,
        newsCache,
        CACHE_DURATION,
        GNEWS_KEY
    );

    return news.find(
        (newsArticle) => newsArticle.id === articleId
    );
};


module.exports = (users, newsCache, CACHE_DURATION, GNEWS_KEY) => {


    // Get personalized news

    router.get('/news', authenticateToken, async (req, res) => {

        const user = users.find(
            (user) => user.email === req.user.email
        );

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

        try {

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

            return res.status(500).json({
                error: 'Failed to fetch news'
            });
        }
    });


    // Mark news article as read

    router.post('/news/:id/read', authenticateToken, async (req, res) => {

        const user = users.find(
            (user) => user.email === req.user.email
        );

        if (!user) {
            return res.status(401).json({
                error: 'User not found'
            });
        }

        if (!Array.isArray(user.readArticles)) {
            user.readArticles = [];
        }

        const articleId = req.params.id;

        try {

            const article = await findArticleForUser(
                user,
                articleId,
                newsCache,
                CACHE_DURATION,
                GNEWS_KEY
            );

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
            }

            return res.status(200).json({
                message: 'Article marked as read'
            });

        } catch (error) {

            return res.status(500).json({
                error: 'Failed to process article'
            });
        }
    });


    // Mark news article as favorite

    router.post('/news/:id/favorite', authenticateToken, async (req, res) => {

        const user = users.find(
            (user) => user.email === req.user.email
        );

        if (!user) {
            return res.status(401).json({
                error: 'User not found'
            });
        }

        if (!Array.isArray(user.favoriteArticles)) {
            user.favoriteArticles = [];
        }

        const articleId = req.params.id;

        try {

            const article = await findArticleForUser(
                user,
                articleId,
                newsCache,
                CACHE_DURATION,
                GNEWS_KEY
            );

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
            }

            return res.status(200).json({
                message: 'Article marked as favorite'
            });

        } catch (error) {

            return res.status(500).json({
                error: 'Failed to process article'
            });
        }
    });


    // Get all read news articles

    router.get('/news/read', authenticateToken, (req, res) => {

        const user = users.find(
            (user) => user.email === req.user.email
        );

        if (!user) {
            return res.status(401).json({
                error: 'User not found'
            });
        }

        if (!Array.isArray(user.readArticles)) {
            user.readArticles = [];
        }

        return res.status(200).json({
            news: user.readArticles
        });
    });


    // Get all favorite news articles

    router.get('/news/favorites', authenticateToken, (req, res) => {

        const user = users.find(
            (user) => user.email === req.user.email
        );

        if (!user) {
            return res.status(401).json({
                error: 'User not found'
            });
        }

        if (!Array.isArray(user.favoriteArticles)) {
            user.favoriteArticles = [];
        }

        return res.status(200).json({
            news: user.favoriteArticles
        });
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

        return res.status(500).json({
            error: 'Failed to search news'
        });
    }

    });


    return router;
};