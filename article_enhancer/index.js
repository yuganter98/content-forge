require('dotenv').config();
const axios = require('axios');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const OpenAI = require('openai');

// Configuration
// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://127.0.0.1:8002/api';
// LM Studio Config
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "lm-studio";
const SITE_URL = process.env.SITE_URL || 'http://localhost:1234/v1';

const openai = new OpenAI({
    baseURL: SITE_URL,
    apiKey: OPENROUTER_API_KEY,
});

const SLEEP_MS = 120000; // 2 minutes

async function processNextArticle() {
    console.log("Starting Enhancement Cycle...");

    // 1. Fetch Articles
    let article;
    try {
        const response = await axios.get(`${API_BASE_URL}/articles`);
        const articles = response.data.data;
        if (!articles || articles.length === 0) {
            console.log("No articles found.");
            return;
        }


        // Filter out articles that have already been enhanced (by checking if a matching [Enhanced] title exists)
        const enhancedTitles = new Set(articles.filter(a => a.title.startsWith('[Enhanced] ')).map(a => a.title));

        article = articles.find(a =>
            !a.title.startsWith('[Enhanced] ') &&
            !enhancedTitles.has(`[Enhanced] ${a.title}`)
        );

        if (!article) {
            console.log("All articles are already enhanced. Waiting...");
            return;
        }

        console.log(`Processing Article: "${article.title}" (ID: ${article.id})`);
    } catch (error) {
        console.error("Failed to fetch articles:", error.message);
        return;
    }

    // ... (Existing Logic: DDG Search, Scrape, LLM) ...
    // Note: I will need to copy the existing inner logic here or refactor.
    // For simplicity with this tool, I will refactor the MAIN function to be the processor
    // and call it from a loop.

    // ... Copying the rest of the logic ...

    // 2. DuckDuckGo Search
    let references = [];
    try {
        console.log(`Searching DuckDuckGo for: "${article.title}"...`);
        const searchUrl = 'https://html.duckduckgo.com/html/';
        const params = new URLSearchParams();
        params.append('q', article.title);

        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        };

        const searchResponse = await axios.post(searchUrl, params, { headers });
        const $ = cheerio.load(searchResponse.data);

        const links = [];
        $('.result__a').each((i, el) => {
            const href = $(el).attr('href');
            if (href && !href.includes('google.com') && !href.includes('beyondchats.com') && !href.includes('duckduckgo.com')) {
                links.push(href);
            }
        });

        const refinedLinks = links.map(l => {
            try {
                const u = new URL(l, 'https://html.duckduckgo.com');
                if (u.searchParams.has('uddg')) return u.searchParams.get('uddg');
                return l;
            } catch (e) { return l; }
        }).filter(l => l && l.startsWith('http'));

        const targetLinks = refinedLinks.slice(0, 2);

        // 3. Scrape Content
        for (const link of targetLinks) {
            try {
                const pageResponse = await axios.get(link, { headers, timeout: 10000 });
                const $$ = cheerio.load(pageResponse.data);
                $$('script').remove(); $$('style').remove();
                const content = $$('p').text();
                if (content.length > 200) references.push({ url: link, content: content.substring(0, 5000) });
            } catch (err) { console.error(`Failed to scrape ${link}:`, err.message); }
        }

    } catch (error) { console.error("Search/Scrape failed:", error.message); }

    if (references.length === 0) {
        references.push({ url: "https://en.wikipedia.org/wiki/Chatbot", content: "Fallback content..." });
    }

    // 4. LLM Rewrite
    try {
        const prompt = `
        Rewrite this article: "${article.title}"
        Original: "${article.content || ''}"
        
        Reference 1: ${references[0].content}
        
        Return in Markdown.
        `;

        const llmResponse = await axios.post("http://localhost:1234/v1/chat/completions", {
            model: "local-model",
            messages: [{ role: "user", content: prompt }]
        });

        const newContent = llmResponse.data.choices[0].message.content;
        const newTitle = `[Enhanced] ${article.title}`;

        await axios.post(`${API_BASE_URL}/articles`, {
            title: newTitle,
            content: newContent,
            source_url: article.source_url || 'https://beyondchats.com',
            published_at: new Date().toISOString()
        });

        console.log("Success! Enhanced article published.");

    } catch (error) {
        console.error("LLM failed:", error.message);
    }
}

// Main Loop
console.log("Starting Enhancer Service Loop...");
setInterval(processNextArticle, SLEEP_MS);
processNextArticle(); // Run immediately on start
