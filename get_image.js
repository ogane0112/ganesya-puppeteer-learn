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

async function processCSV(csvPath) {
    try {
        const csvContent = await fs.readFile(csvPath, 'utf-8');
        const records = await new Promise((resolve, reject) => {
            csv.parse(csvContent, {
                columns: true,
                skip_empty_lines: true
            }, (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });

        const outputDir = './downloaded_images';
        await fs.mkdir(outputDir, { recursive: true });

        for (const [index, record] of records.entries()) {
            const imageUrl = record['商品画像'];
            if (!imageUrl) continue;

            const extension = path.extname(imageUrl) || '.jpg';
            const outputPath = path.join(outputDir, `image_${index}${extension}`);
            await downloadImage(imageUrl, outputPath);
        }
    } catch (error) {
        console.error('CSVの処理中にエラーが発生:', error);
    }
}

const csvPath = 'output.csv';
processCSV(csvPath);
