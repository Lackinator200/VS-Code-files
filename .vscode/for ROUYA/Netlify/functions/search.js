// netlify/functions/search.js

// Import necessary libraries
// 'node-fetch' is needed if your Node.js runtime doesn't have global fetch (older versions)
// Netlify functions typically run on Node.js 18+, which has native fetch.
// const fetch = require('node-fetch'); // Uncomment if you encounter 'fetch is not defined'

// Import the OpenAI client library
// You need to install this: npm install openai
const { OpenAI } = require('openai');

// This is your main Netlify Function handler
exports.handler = async (event, context) => {
    // 1. Basic Request Validation
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

    // Destructure parameters from the frontend request
    const { keyword, dateFilter, sourceFilter, contentType, isUserVerified, mustMatch } = params;

    console.log('Received search request:', { keyword, dateFilter, sourceFilter, contentType, isUserVerified, mustMatch });

    // --- 2. Make API Calls to Social Media/News Platforms (Placeholder) ---
    // THIS IS WHERE YOU WOULD INTEGRATE WITH REAL PLATFORM APIs.
    // This is the most complex part and requires platform-specific integration.
    // You will need to:
    // a. Obtain API keys/access tokens for each platform (e.g., Facebook App ID/Secret, X Bearer Token).
    // b. Store these securely as Netlify Environment Variables (see Step 4).
    // c. Use `fetch` or a dedicated client library (if available) to make HTTP requests
    //    to each platform's API endpoint (e.g., Facebook Graph API, X API, TikTok API, Khaleej Times API).
    // d. Handle authentication, rate limits, and error responses for each platform.
    // e. Parse and normalize the data received from each platform into a consistent format.

    let allResults = [];

    // --- Simulated API Calls (Replace with your real API calls) ---
    // For demonstration, we'll use a simplified mock data structure here.
    // In a real scenario, you would fetch this data from the actual APIs.
    // The `keyword` is used to make the mock data somewhat dynamic.
    const mockLiveResults = [
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
            id: 'live_news_1',
            title: `Khaleej Times: Impact of "${keyword || 'economy'}" on local economy`,
            content: `An in-depth analysis by Khaleej Times on how current events related to "${keyword || 'economy'}" are shaping the region's economic outlook. This is a mock result.`,
            source: 'khaleej_times',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            type: 'news',
            isUserVerified: false,
            keywords: [keyword, 'economy', 'Khaleej Times']
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
        }
    ];

    allResults = mockLiveResults; // In a real app, this would be combined results from all APIs

    // --- 3. (Optional) Integrate with an LLM (e.g., OpenAI) for analysis ---
    // This is where "your own Open AI" comes into play for deeper insights.
    // Example: Summarizing content, sentiment analysis, extracting entities.

    // Initialize OpenAI client with your API key from environment variables
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    try {
        for (const result of allResults) {
            // Only process if content exists and LLM key is available
            if (result.content && process.env.OPENAI_API_KEY) {
                // Example: Summarize each result's content
                const completion = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo", // You can use "gpt-4" or other models
                    messages: [
                        { role: "system", content: "You are a helpful assistant that summarizes text concisely." },
                        { role: "user", content: `Summarize the following content in 30 words: ${result.content}` }
                    ],
                    max_tokens: 50 // Adjust based on desired summary length
                });
                result.summary = completion.choices[0].message.content;

                // Example: Sentiment analysis
                const sentimentCompletion = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: "Analyze the sentiment of the following text and respond with only one word: positive, negative, or neutral." },
                        { role: "user", content: `Text: "${result.content}"` }
                    ],
                    max_tokens: 5 // Just one word
                });
                result.sentiment = sentimentCompletion.choices[0].message.content.toLowerCase().trim();
            }
        }
    } catch (llmError) {
        console.error("LLM integration error:", llmError);
        // Handle LLM errors gracefully, perhaps by skipping LLM processing for that item
        // or logging the error without failing the entire search.
    }


    // --- 4. Apply Filters (if not already done by platform APIs) ---
    // It's often more efficient to filter as much as possible at the API source,
    // but you might need to apply additional filters here on the aggregated data.
    let finalFilteredResults = allResults.filter(item => {
        const itemText = (item.title + ' ' + item.content + ' ' + (item.keywords ? item.keywords.join(' ') : '')).toLowerCase();

        // Keyword filter (backend-side re-check for consistency)
        if (keyword && mustMatch && !itemText.includes(keyword.toLowerCase())) {
            return false;
        }
        // If 'mustMatch' is false, the keyword is optional.
        // If a keyword is provided and not found, it's still filtered out unless mustMatch is false.
        // The previous logic for !mustMatch was a bit confusing. Let's simplify:
        // If keyword is provided AND mustMatch is false AND itemText does NOT include keyword,
        // it means the keyword was provided but wasn't found, so it should be filtered out.
        // If keyword is empty, it passes this check.
        if (keyword && !mustMatch && !itemText.includes(keyword.toLowerCase())) {
            return false;
        }


        // Date filter
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
                if ((now - itemDate) > (30 * 24 * 60 * 60 * 1000)) return false; // Approx month
                break;
            case 'past_year':
                if ((now - itemDate) > (365 * 24 * 60 * 60 * 1000)) return false; // Approx year
                break;
            case 'latest':
                // 'latest' implies sorting, not filtering a time range. No filter needed here.
                break;
            // 'oldest' is also a sort order.
        }

        // Source filter
        // Ensure sourceFilter matches the format in mock data (e.g., 'khaleej_times')
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


    // 5. Return results to frontend
    return {
        statusCode: 200,
        body: JSON.stringify(finalFilteredResults),
        headers: {
            'Content-Type': 'application/json',
            // IMPORTANT: Add CORS headers to allow your frontend to access this function.
            // In development, '*' is fine. In production, replace '*' with your Netlify site URL (e.g., 'https://your-site-name.netlify.app').
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    };
};