const puppeteer = require('puppeteer');
const fs = require('fs');
const sleep = (time) => new Promise((r) => setTimeout(r, time));

(async () => {
    // コマンドライン引数の取得
    const args = process.argv.slice(2);
    
    // 引数チェック
    if (args.length < 1) {
        console.error('Usage: node script.js <product_url> [output_filename]');
        process.exit(1);
    }

    // 引数からURLとファイル名を取得（第2引数がない場合はデフォルトでoutput.csv）
    const [productUrl, outputFile = 'output.csv'] = args.reverse().find(a => a.endsWith('.csv')) 
        ? args.reverse() 
        : [args[0], 'output.csv'];

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    console.log(`Processing: ${productUrl}`);
    
    await page.goto(productUrl, { waitUntil: 'networkidle2' });
    await sleep(Math.floor(Math.random() * 5000) + 1000);
    
    try {
        await page.click('button.comet-v2-btn.comet-v2-btn-slim.comet-v2-btn-large.extend--btn--TWsP5SV.comet-v2-btn-important');
        await sleep(Math.floor(Math.random() * 5000) + 1000);
    } catch (error) {
        console.log('ボタンクリックに失敗しましたが処理を継続します');
    }

    const imageUrls = await page.evaluate(() => {
        const a = document.querySelector('#root > div > div.pdp-body.pdp-wrap > div > div.pdp-body-top-left');
        return Array.from(a?.querySelectorAll('img') || [])
            .map(img => img.src)
            .filter(src => src.includes('ae-pic-a1.aliexpress-media.com') || src.includes('sc04.alicdn.com'));
    });

    console.log(`取得した画像URL数: ${imageUrls.length}`);
    
    // CSV書き込み
    const csvContent = imageUrls.map(url => `${productUrl},${url}`).join('\n');
    fs.writeFileSync(outputFile, csvContent);
    console.log(`ファイルに保存しました: ${outputFile}`);

    await browser.close();
})();
