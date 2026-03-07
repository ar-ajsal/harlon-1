const puppeteer = require('puppeteer');
(async () => {
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();

        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
        page.on('requestfailed', request => console.log('REQ FAIL:', request.url(), request.failure()?.errorText));

        console.log('Navigating...');
        await page.goto('http://localhost:4174', { waitUntil: 'networkidle0' });

        const content = await page.content();
        console.log('CONTENT ROOT:', content.includes('id=\"root\"') ? 'has root' : 'no root');

        const text = await page.$eval('#root', el => el.innerHTML).catch(e => e.message);
        console.log('HTML ROOT CONTENT:', text);

        await browser.close();
        console.log('Done script.');
    } catch (e) {
        console.error('Puppeteer crash:', e);
    }
})();
