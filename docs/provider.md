# Provider & IA

An exploration of different providers to test sentence duplication in a worker with their respective costs.

Priority testing:
- Perplexity (per request, 0,005): implemented
- Apify google-search-results-serp-scraper (per request, 0,0005): Todo testing this

## Perplexity (default)

**API /search (Use Search)** 
- cost: 5$/1000 request (per request, 0,005)
- TODO: this API is implemented, change name "perplexity to perplexity search"
    - name (in database call api record): perplexity search
**API /chat/completion (Use LLM)**
- Status: Not use (more cost)
- cost: 20$/1000 request 

## Google Custom API (not AI)(for stability? Not priority)
- TODO: implement this for stability (not urgent)
- cost: 5$/1000 request (per request, 0,005)

## Private Scraping Apify (Create my script)
- cost: ???
- Create my scraping google SERP in Apify (author) -> private authors, and pay consomations in GO

## Private Scraping Apify (Create my script)

## Apify Actor : google-search-results-serp-scraper
- TODO: test this 
- cost: 0,50$/1000 request (per request, 0,0005 )
- https://apify.com/scraperlink/google-search-results-serp-scraper

## DataForSEO
- cost: 0,6–2$/1000 request, (per request, 0,0006–0,002$) (General)
- API : https://dataforseo.com/pricing/serp/google-organic-serp-api
    - Standard Queue (response: 5 minutes, $0.0006 x 5 for parameter "allintext" = 0,003 per request)
    - Priority Queue (response: 1 minutes, $0.0012 x 5 for parameter "allintext" = 0,006 per request)
    - Standard Queue (response: 6 Seconds, $0.002 x 5 for parameter "allintext" = 0,01 per request)

## API brave
- cost: 3$/1000 request,  (per request, 0,003$)
- free 2000 request/month

## API bing
- cost: 3$/1000 request, (per request, 0,003 $)

## OPENAI (Not need, not instant search)

- gpt-3.5-turbo not find all occurence on web

## Common Crawl
- https://commoncrawl.org/
- The Common Crawl is too large; handling such massive amounts of data becomes too expensive per query
