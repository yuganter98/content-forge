<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ScrapeOldestArticles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'scrape:beyondchats';
    protected $description = 'Scrape the 5 oldest articles from BeyondChats blog';

    public function handle()
    {
        $this->info('Starting scrape (Native DOM)...');

        $client = new \GuzzleHttp\Client(['verify' => false]);
        
        // Helper to fetch and parse with DOMDocument
        $fetchAndParse = function($url) use ($client) {
            try {
                $response = $client->get($url);
                $html = (string) $response->getBody();
                
                $dom = new \DOMDocument();
                // Suppress parse errors for malformed HTML
                libxml_use_internal_errors(true);
                $dom->loadHTML($html);
                libxml_clear_errors();
                
                $xpath = new \DOMXPath($dom);
                return $xpath;
            } catch (\Exception $e) {
                $this->error("Failed to fetch $url: " . $e->getMessage());
                return null;
            }
        };

        $articles = [];

        // 1. Fetch Page 15 (Oldest)
        $this->info('Fetching Page 15...');
        $xpath15 = $fetchAndParse('https://beyondchats.com/blogs/page/15/');
        if ($xpath15) {
            $nodes = $xpath15->query('//article');
            foreach ($nodes as $node) {
                $articles[] = $this->parseArticle($node, $xpath15);
            }
        }

        // 2. Fetch Page 14 (Next Oldest)
        $this->info('Fetching Page 14...');
        $xpath14 = $fetchAndParse('https://beyondchats.com/blogs/page/14/');
        if ($xpath14) {
             $nodes = $xpath14->query('//article');
             $page14Articles = [];
             foreach ($nodes as $node) {
                 $page14Articles[] = $this->parseArticle($node, $xpath14);
             }
             
             // Ascending order check: The layout is descending (newest at top).
             // So bottom of Page 14 is OLDER than top of Page 14.
             // We want oldest.
             // Page 15 article is OLDEST.
             // Page 14 bottom articles are next oldest.
             // So we take the LAST 4 from page 14.
             
             $oldestFromPage14 = array_slice($page14Articles, -4);
             $articles = array_merge($articles, $oldestFromPage14);
        }

        // 3. Save to DB
        foreach ($articles as $data) {
            if (!$data) continue;
            
            \App\Models\Article::updateOrCreate(
                ['source_url' => $data['source_url']],
                $data
            );
            $this->info("Saved: {$data['title']}");
        }
        
        $this->info('Scraping completed.');
    }

    private function parseArticle($node, $xpath)
    {
        try {
            // Helper for class query
            $classQuery = function($cls) {
                 return "descendant::*[contains(concat(' ', normalize-space(@class), ' '), ' $cls ')]";
            };

            // Queries relative to the article node
            $titleNode = $xpath->query($classQuery('entry-title') . '/a', $node)->item(0);
            $dateNode = $xpath->query($classQuery('ct-meta-element-date'), $node)->item(0);
            $excerptNode = $xpath->query($classQuery('entry-excerpt') . '/p', $node)->item(0);
            // Fallback for excerpt if inside entry-content
            if (!$excerptNode) {
                 $excerptNode = $xpath->query($classQuery('entry-content') . '/p', $node)->item(0);
            }

            return [
                'title' => $titleNode ? $titleNode->textContent : 'No Title',
                'source_url' => $titleNode ? $titleNode->getAttribute('href') : '',
                'published_at' => $dateNode ? $dateNode->textContent : null,
                'content' => $excerptNode ? $excerptNode->textContent : '',
            ];
        } catch (\Exception $e) {
            return null;
        }
    }
}
