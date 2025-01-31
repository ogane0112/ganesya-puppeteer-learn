const axios = require('axios');
const fs = require('fs').promises;
const csv = require('csv-parse');
const path = require('path');

async function downloadImage(url, outputPath) {
    try {
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'arraybuffer'
        });
        
        await fs.writeFile(outputPath, response.data);
        console.log(`ダウンロード完了: ${outputPath}`);
    } catch (error) {
        console.error(`ダウンロードエラー (${url}):`, error.message);
    }
}


const args = process.argv.slice(2);
if (args.length < 2) {
    console.error('使用法: node get_image_url_cm.js <csvPath> <outputDir>');
    process.exit(1);
}


async function processCSV(csvPath, outputDir) {
    try {
        const csvContent = await fs.readFile(csvPath, 'utf-8');
        const records = await new Promise((resolve, reject) => {
            csv.parse(csvContent, {
                columns: false,
                skip_empty_lines: true
            }, (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });

        await fs.mkdir(outputDir, { recursive: true });

        for (const [index, record] of records.entries()) {
            const imageUrl = record[1]; // 2列目の画像URLを取得
            if (!imageUrl) continue;

            const extension = path.extname(imageUrl) || '.jpg';
            const outputPath = path.join(outputDir, `image_${index}${extension}`);
            await downloadImage(imageUrl, outputPath);
        }
    } catch (error) {
        console.error('CSVの処理中にエラーが発生:', error);
    }
}


const csvPath = args[0];
const outputDir = args[1];
processCSV(csvPath, outputDir);