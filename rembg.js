// convert-images.js
const fs_normal = require('fs');
const fs = require('fs').promises;
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');
const sharp = require('sharp');

const API_KEY = "sandbox_debf5871bc7d7fee2773460febfe8c0244265e8f" // ここにあなたのAPIキーを入力

async function convertAvifToJpg(inputPath) {
  try {
    const outputPath = path.join(
      path.dirname(inputPath),
      `converted-${path.basename(inputPath, '.avif')}.jpg`
    );
    
    await sharp(inputPath)
      .jpeg({ quality: 80 })
      .toFile(outputPath);
      
    console.log(`AVIF変換完了: ${outputPath}`);
  } catch (error) {
    console.error(`AVIF変換エラー (${inputPath}):`, error);
  }
}

async function removeBackground(imagePath) {
  const form = new FormData();
  form.append('image_file', fs_normal.createReadStream(imagePath));

  try {
    const response = await axios.post('https://sdk.photoroom.com/v1/segment', form, {
      headers: {
        ...form.getHeaders(),
        'x-api-key': API_KEY
      },
      responseType: 'arraybuffer'
    });

    const outputPath = path.join(path.dirname(imagePath), 'output_' + path.basename(imagePath));
    await fs.writeFile(outputPath, response.data);
    console.log(`背景削除完了: ${outputPath}`);
  } catch (error) {
    console.error(`背景削除エラー (${imagePath}):`, error.message);
  }
}

async function processDirectory(dirPath) {
  try {
    const files = await fs.readdir(dirPath);
    
    // AVIF画像の処理
    const avifFiles = files.filter(file => /\.avif$/i.test(file));
    console.log(`${avifFiles.length}個のAVIFファイルが見つかりました`);
    
    // 背景削除対象の画像
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|webp)$/i.test(file)
    );
    console.log(`${imageFiles.length}個の画像ファイルが見つかりました`);

    // AVIF変換の実行
    for (const file of avifFiles) {
      const imagePath = path.join(dirPath, file);
      console.log(`AVIF変換中: ${file}`);
      await convertAvifToJpg(imagePath);
    }

    // 背景削除の実行
    for (const file of imageFiles) {
      const imagePath = path.join(dirPath, file);
      console.log(`背景削除中: ${file}`);
      await removeBackground(imagePath);
    }
  } catch (error) {
    console.error('ディレクトリの処理中にエラーが発生:', error);
  }
}

// コマンドライン引数からディレクトリパスを取得
const directoryPath = process.argv[2];

if (!directoryPath) {
  console.error('使用方法: node rembg.js <ディレクトリパス>');
  process.exit(1);
}

processDirectory(directoryPath);
