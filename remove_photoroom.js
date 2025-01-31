const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function removeTextFromImage(imagePath) {
  try {
    const image = sharp(imagePath);
    const metadata = await image.metadata();

    // テキスト領域を白く塗りつぶす
    const binarizedImageBuffer = await image
      .threshold(180) // テキスト検出のための二値化
      .negate() // 白黒反転
      .blur(2) // ノイズ除去
      .gamma(2.2) // コントラスト調整
      .toBuffer();

    await sharp(imagePath)
      .composite([{ input: binarizedImageBuffer, blend: 'dest-in' }])
      .toFile(path.join(
        path.dirname(imagePath),
        `no-text-${path.basename(imagePath)}`
      ));

    console.log(`処理完了: ${imagePath}`);
  } catch (error) {
    console.error(`エラー (${imagePath}):`, error);
  }
}

async function processDirectory(dirPath) {
  try {
    const files = await fs.readdir(dirPath);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|webp)$/i.test(file)
    );

    console.log(`${imageFiles.length}個の画像が見つかりました`);

    for (const file of imageFiles) {
      const imagePath = path.join(dirPath, file);
      console.log(`処理中: ${file}`);
      await removeTextFromImage(imagePath);
    }
  } catch (error) {
    console.error('ディレクトリの処理中にエラーが発生:', error);
  }
}

// コマンドライン引数からディレクトリパスを取得
const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error('使用方法: node remove_photoroom.js <ディレクトリパス>');
  process.exit(1);
}

const dirPath = args[0];
processDirectory(dirPath);
