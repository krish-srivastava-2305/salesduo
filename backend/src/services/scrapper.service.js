import axios from 'axios';
import * as cheerio from 'cheerio';

async function getAmazonProductDetails(asin) {
    const url = `https://www.amazon.in/dp/${asin}`;

    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Referer': 'https://www.amazon.com/',
        'DNT': '1',
        'Connection': 'keep-alive',
    };

    try {
        console.log(`Fetching URL: ${url}`);
        const response = await axios.get(url, { headers });
        console.log(`Received response for ASIN ${asin}`);

        const $ = cheerio.load(response.data);
        console.log(`Parsing content for ASIN ${asin}`);

        // 1. Get Title
        const title = $('#productTitle').text().trim();

        // 2. Get Bullet Points
        const bulletPoints = [];
        $('#feature-bullets .a-list-item').each((i, el) => {
            bulletPoints.push($(el).text().trim());
        });

        // 3. Get Description
        let description = $('#productDescription p').text().trim();
        
        const productDetails = {
            asin: asin,
            title: title || "Title not found",
            bullet_points: bulletPoints.length ? bulletPoints : ["Bullets not found"],
            description: description || "Description not found",
        };

        return productDetails;

    } catch (error) {
        console.error(`Error fetching ASIN ${asin}:`);
        return { error: "Failed to scrape product." };
    }
}

export { getAmazonProductDetails };