const puppeteer = require('puppeteer');
const fs = require('fs');
const sleep = (time) => new Promise((r) => setTimeout(r, time));//timeはミリ秒

(async () => {
    // Puppeteerでブラウザを起動
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // AliExpressの商品ページURLを指定
    const productUrl = 'https://ja.aliexpress.com/item/1005007408073040.html';
    await page.goto(productUrl, { waitUntil: 'networkidle2' });

    // ランダムな秒数待機
    await sleep(Math.floor(Math.random() * 5000) + 1000);

    // ボタンを押す
    await page.click('button.comet-v2-btn.comet-v2-btn-slim.comet-v2-btn-large.extend--btn--TWsP5SV.comet-v2-btn-important');

    // さらにランダムな秒数待機
    await sleep(Math.floor(Math.random() * 5000) + 1000);

    // 商品画像のURLを取得
    const imageUrls = await page.evaluate(() => {
        // imgタグを選択し、src属性を取得
        const a = document.querySelector('#root > div > div.pdp-body.pdp-wrap > div > div.pdp-body-top-left');
        const images = Array.from(a.querySelectorAll('img'));
        
        return images.map(img => img.src).filter(src => src.includes('ae-pic-a1.aliexpress-media.com')||src.includes('sc04.alicdn.com'))
    });

    console.log('商品画像URL:', imageUrls);

    // CSV形式で保存
    const csvContent = imageUrls.map(url => `${productUrl},${url}`).join('\n');
    fs.writeFileSync('output.csv', csvContent);

    // ブラウザを閉じる
    await browser.close();
})();
