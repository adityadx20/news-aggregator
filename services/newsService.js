const axios = require('axios');

const fetchNews = async (preferences, newsCache, CACHE_DURATION, GNEWS_KEY) => {

    const cacheKey = preferences
        .slice()
        .sort()
        .join('|');

    const cachedData = newsCache.get(cacheKey);

    if (
        cachedData &&
        Date.now() - cachedData.timestamp < CACHE_DURATION
    ) {
        return cachedData.news;
    }

    const query = preferences.join(' OR ');

    try {
        const response = await axios.get(
            'https://gnews.io/api/v4/search',
            {
                params: {
                    q: query,
                    lang: 'en',
                    country: 'in',
                    max: 10,
                    sortby: 'publishedAt',
                    apikey: GNEWS_KEY
                }
            }
        );

        const data = response.data;

        if (!Array.isArray(data.articles)) {
            throw new Error('Invalid response from news service');
        }

        const news = data.articles;

        newsCache.set(cacheKey, {
            news,
            timestamp: Date.now()
        });

        return news;

    } catch (error) {

        if (error.response) {
            const apiError = new Error(
                `GNews API error: ${error.response.status}`
            );

            apiError.status = error.response.status;
            apiError.details = error.response.data;

            throw apiError;
        }

        throw error;
    }
};

module.exports = fetchNews;