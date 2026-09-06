const fetchNews = async (preferences,newsCache,CACHE_DURATION,GNEWS_KEY) =>
{
    const cacheKey = preferences
        .slice()
        .sort()
        .join('|');

    const cachedData = newsCache.get(cacheKey);

    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION ) 
    return cachedData.news
        

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
        const errorData = await response.json().catch(() => ({}));

        const error = new Error(
            `GNews API error: ${response.status}`
        );

        error.status = response.status;
        error.details = errorData;

        throw error;
    }

    const data = await response.json();

    if (!Array.isArray(data.articles)) {
        throw new Error('Invalid response from news service');
    }

    const news = data.articles;

    newsCache.set(cacheKey, {
        news,
        timestamp: Date.now()
    });

    return news;
}

module.exports = fetchNews;