// netlify/functions/search.js

// Import necessary libraries
// const fetch = require('node-fetch'); // Uncomment if you encounter 'fetch is not defined' (Node.js < 18)
const { OpenAI } = require('openai'); // Assuming you're still using OpenAI

// This is your main Netlify Function handler
exports.handler = async (event, context) => {
    // 1. Basic Request Validation (existing code)
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed' }),
            headers: { 'Content-Type': 'application/json' },
        };
    }

    let params;
    try {
        params = JSON.parse(event.body);
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Invalid JSON body' }),
            headers: { 'Content-Type': 'application/json' },
        };
    }

    const { keyword, dateFilter, sourceFilter, contentType, isUserVerified, mustMatch } = params;

    console.log('Received search request:', { keyword, dateFilter, sourceFilter, contentType, isUserVerified, mustMatch });

    let allResults = [];

    // --- 2. Make API Calls to Social Media/News Platforms ---

    // --- NewsAPI.org Integration ---
    const newsApiKey = process.env.NEWS_API_KEY;
    if (newsApiKey && (sourceFilter === 'all' || sourceFilter === 'newsapi_org' || sourceFilter === 'news')) {
        try {
            // NewsAPI.org 'everything' endpoint for broad search
            // You can adjust parameters like language, sortBy, domains, etc.
            // Note: dateFilter mapping might need more precise logic for 'from' and 'to' dates
            const newsApiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(keyword)}&language=en&sortBy=relevancy&apiKey=${newsApiKey}`;

            // Example for date filtering (NewsAPI.org uses 'from' and 'to' parameters)
            // This is a simplified mapping. For production, you'd calculate exact dates.
            const now = new Date();
            let fromDate;
            if (dateFilter === 'past_day') {
                fromDate = new Date(now.setDate(now.getDate() - 1)).toISOString().split('T')[0];
            } else if (dateFilter === 'past_week') {
                fromDate = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
            } else if (dateFilter === 'past_month') {
                fromDate = new Date(now.setMonth(now.getMonth() - 1)).toISOString().split('T')[0];
            } else if (dateFilter === 'past_year') {
                fromDate = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString().split('T')[0];
            }

            let finalNewsApiUrl = newsApiUrl;
            if (fromDate) {
                finalNewsApiUrl += `&from=${fromDate}`;
            }

            console.log("Fetching from NewsAPI:", finalNewsApiUrl);
            const newsResponse = await fetch(finalNewsApiUrl);
            const newsData = await newsResponse.json();

            if (newsData.status === 'ok' && newsData.articles) {
                const newsArticles = newsData.articles.map(article => ({
                    id: `newsapi-${article.source.id || article.source.name}-${article.publishedAt}`,
                    title: article.title,
                    content: article.description || article.content, // Use description if content is truncated
                    source: article.source.name.toLowerCase().replace(/\s/g, '_'), // Normalize source name
                    date: article.publishedAt,
                    type: 'news',
                    isUserVerified: false, // News articles are typically not 'user verified'
                    url: article.url, // Add the original article URL
                    keywords: [keyword, 'news', article.source.name.toLowerCase()] // Example keywords
                }));
                allResults = allResults.concat(newsArticles);
            } else {
                console.error("Error from NewsAPI:", newsData.message);
            }

        } catch (error) {
            console.error("Failed to fetch from NewsAPI:", error);
        }
    }

    // --- Existing Mock Social Media Data (for other sources) ---
    // You would replace these with actual API calls to Facebook, X, TikTok, Instagram etc.
    const mockSocialMediaResults = [
        {
            id: 'live_post_1',
            title: `Breaking: "${keyword || 'AI'}" trending on X!`,
            content: `Users are actively discussing "${keyword || 'AI'}" on X, with a surge in related posts and conversations. This is a mock result.`,
            source: 'x',
            date: new Date().toISOString(),
            type: 'posts',
            isUserVerified: true,
            keywords: [keyword, 'X', 'trending']
        },
        {
            id: 'live_facebook_1',
            title: `Facebook Group: Discussion on "${keyword || 'community'}"`,
            content: `Members of a local Facebook group are actively discussing community initiatives related to "${keyword || 'community'}". This is a mock result.`,
            source: 'facebook',
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
            type: 'posts',
            isUserVerified: false,
            keywords: [keyword, 'Facebook', 'community']
        },
        {
            id: 'live_instagram_1',
            title: `Instagram Influencer: My take on "${keyword || 'fashion'}"`,
            content: `Popular Instagram influencer shares their latest fashion tips and trends related to "${keyword || 'fashion'}". This is a mock result.`,
            source: 'instagram',
            date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
            type: 'posts',
            isUserVerified: true,
            keywords: [keyword, 'Instagram', 'fashion']
        },
        {
            id: 'live_tiktok_1',
            title: `Viral TikTok: "${keyword || 'challenge'}" challenge takes over!`,
            content: `A new challenge featuring "${keyword || 'challenge'}" is gaining immense popularity on TikTok, with millions of views. This is a mock result.`,
            source: 'tiktok',
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            type: 'posts',
            isUserVerified: true,
            keywords: [keyword, 'TikTok', 'challenge', 'viral']
        }
    ];

    // Only add mock social media results if 'all' sources or a specific social media source is selected
    if (sourceFilter === 'all' || ['facebook', 'instagram', 'x', 'tiktok'].includes(sourceFilter)) {
        allResults = allResults.concat(mockSocialMediaResults.filter(item => {
            if (sourceFilter !== 'all' && item.source !== sourceFilter) {
                return false;
            }
            return true;
        }));
    }


    // --- 3. (Optional) Integrate with an LLM (e.g., OpenAI) for analysis (existing code) ---
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    try {
        for (const result of allResults) {
            if (result.content && process.env.OPENAI_API_KEY) {
                // Summarization
                const completion = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: "You are a helpful assistant that summarizes text concisely." },
                        { role: "user", content: `Summarize the following content in 30 words: ${result.content}` }
                    ],
                    max_tokens: 50
                });
                result.summary = completion.choices[0].message.content;

                // Sentiment analysis
                const sentimentCompletion = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: "Analyze the sentiment of the following text and respond with only one word: positive, negative, or neutral." },
                        { role: "user", content: `Text: "${result.content}"` }
                    ],
                    max_tokens: 5
                });
                result.sentiment = sentimentCompletion.choices[0].message.content.toLowerCase().trim();
            }
        }
    } catch (llmError) {
        console.error("LLM integration error:", llmError);
    }


    // --- 4. Apply Filters (existing code, ensure consistency with new data) ---
    let finalFilteredResults = allResults.filter(item => {
        const itemText = (item.title + ' ' + item.content + ' ' + (item.keywords ? item.keywords.join(' ') : '')).toLowerCase();

        // Keyword filter
        if (keyword && mustMatch && !itemText.includes(keyword.toLowerCase())) {
            return false;
        }
        if (keyword && !mustMatch && !itemText.includes(keyword.toLowerCase())) {
            if (keyword.length > 0 && !itemText.includes(keyword.toLowerCase())) {
                return false;
            }
        }

        // Date filter (re-checked here for combined results)
        const itemDate = new Date(item.date);
        const now = new Date();

        switch (dateFilter) {
            case 'past_day':
                if ((now - itemDate) > (24 * 60 * 60 * 1000)) return false;
                break;
            case 'past_week':
                if ((now - itemDate) > (7 * 24 * 60 * 60 * 1000)) return false;
                break;
            case 'past_month':
                if ((now - itemDate) > (30 * 24 * 60 * 60 * 1000)) return false;
                break;
            case 'past_year':
                if ((now - itemDate) > (365 * 24 * 60 * 60 * 1000)) return false;
                break;
            case 'latest':
                break;
        }

        // Source filter (re-checked here for combined results)
        // Normalize sourceFilter for comparison if needed (e.g., 'khaleej_times' vs 'Khaleej Times')
        if (sourceFilter !== 'all' && item.source !== sourceFilter) return false;

        // Content Type filter
        if (contentType === 'news' && item.type !== 'news') return false;
        if (contentType === 'blogs' && item.type !== 'blogs') return false;
        if (contentType === 'posts' && item.type !== 'posts') return false;

        // User verified filter
        if (isUserVerified && !item.isUserVerified) return false;

        return true;
    });

    // Optional: Sort results by date if 'latest' or 'oldest' is selected
    if (dateFilter === 'latest') {
        finalFilteredResults.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (dateFilter === 'oldest') {
        finalFilteredResults.sort((a, b) => new Date(a.date) - new Date(b.date));
    }


    // 5. Return results to frontend (existing code)
    return {
        statusCode: 200,
        body: JSON.stringify(finalFilteredResults),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    };
};