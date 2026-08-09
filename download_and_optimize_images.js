/**
 * download_and_optimize_images.js
 * 1. Find external image URLs in all posts
 * 2. Download them to source/media/_ext/
 * 3. Update markdown files with local paths
 * 4. Optimize all images (resize + compress)
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sharp = require('sharp');

const POSTS_DIR = path.join(__dirname, 'source', '_posts');
const MEDIA_DIR = path.join(__dirname, 'source', 'media');
const EXT_DIR = path.join(MEDIA_DIR, 'ext');

if (!fs.existsSync(EXT_DIR)) fs.mkdirSync(EXT_DIR, { recursive: true });

const IMAGE_URL_RE = /https?:\/\/[^\s"'\)]+\.(?:png|jpg|jpeg|gif|webp)/gi;
const MAX_WIDTH = 1200;

function walk(dir, urlSet) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(full, urlSet); continue; }
    if (!entry.name.endsWith('.md')) continue;
    const content = fs.readFileSync(full, 'utf-8');
    const matches = content.match(IMAGE_URL_RE) || [];
    matches.forEach(url => urlSet.add(url));
  }
}

function* findMdFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* findMdFiles(full);
    } else if (entry.name.endsWith('.md')) {
      yield full;
    }
  }
}

function collectImages(dir, arr) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { collectImages(full, arr); continue; }
    if (/\.(png|jpg|jpeg|gif)$/i.test(entry.name)) {
      arr.push(full);
    }
  }
}

function updateAllMd(oldPath, newPath) {
  const files = findMdFiles(POSTS_DIR);
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    if (content.includes(oldPath)) {
      const re = new RegExp(escapeRegex(oldPath), 'g');
      const newContent = content.replace(re, newPath);
      fs.writeFileSync(file, newContent, 'utf-8');
      console.log(`  Updated ref in: ${path.relative(__dirname, file)}`);
    }
  }
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function main() {
  // ============ Phase 1: Download external images ============
  const EXTERNAL_URLS = new Set();
  walk(POSTS_DIR, EXTERNAL_URLS);
  console.log(`Found ${EXTERNAL_URLS.size} external image(s) to download`);

  const downloadPromises = [...EXTERNAL_URLS].map(async (url) => {
    const ext = path.extname(new URL(url).pathname) || '.png';
    const fname = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
    const dest = path.join(EXT_DIR, fname);
    const localPath = `/media/ext/${fname}`;

    try {
      console.log(`Downloading: ${url}`);
      execSync(`curl -sL -o "${dest}" "${url}"`, { timeout: 30000, stdio: 'pipe' });
      const stat = fs.statSync(dest);
      if (stat.size < 100) {
        console.warn(`  SKIP (too small): ${url}`);
        return null;
      }
      console.log(`  Saved: ${fname} (${Math.round(stat.size / 1024)}KB)`);
      return { url, localPath, dest };
    } catch (e) {
      console.error(`  FAIL: ${url} - ${e.message}`);
      return null;
    }
  });

  const downloaded = (await Promise.all(downloadPromises)).filter(Boolean);

  // ============ Phase 2: Update markdown files ============
  for (const { url, localPath } of downloaded) {
    const files = findMdFiles(POSTS_DIR);
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes(url)) {
        const newContent = content.replace(url, localPath);
        fs.writeFileSync(file, newContent, 'utf-8');
        console.log(`  Updated: ${path.relative(__dirname, file)}`);
      }
    }
  }

  // ============ Phase 3: Optimize all images ============
  console.log('\n=== Optimizing all images ===');
  const imageFiles = [];
  collectImages(MEDIA_DIR, imageFiles);
  const optimizeResults = [];

  for (const imgPath of imageFiles) {
    const stat = fs.statSync(imgPath);
    if (stat.size > 5 * 1024 * 1024) continue;
    try {
      const metadata = await sharp(imgPath).metadata();
      const origSize = stat.size;
      const opts = { withoutEnlargement: true };

      if (metadata.width > MAX_WIDTH) {
        opts.width = MAX_WIDTH;
        opts.height = Math.round(metadata.height * (MAX_WIDTH / metadata.width));
        console.log(`  Resize: ${path.relative(__dirname, imgPath)} ${metadata.width}x${metadata.height} -> ${MAX_WIDTH}x${opts.height}`);
      }

      const ext = path.extname(imgPath).toLowerCase();
      if (ext === '.gif') continue;

      const outputDir = path.dirname(imgPath);
      const outputName = path.basename(imgPath, ext) + '.webp';
      const outputPath = path.join(outputDir, outputName);

      await sharp(imgPath)
        .webp({ quality: 80 })
        .resize(opts)
        .toFile(outputPath);

      const oldMediaPath = '/media/' + path.relative(__dirname, imgPath).replace(/^source\/media\//, '').replace(/\\/g, '/');
      const newMediaPath = '/media/' + path.relative(__dirname, outputPath).replace(/^source\/media\//, '').replace(/\\/g, '/');
      updateAllMd(oldMediaPath, newMediaPath);
      fs.unlinkSync(imgPath);

      const newSize = fs.statSync(outputPath).size;
      const saving = Math.round((1 - newSize / origSize) * 100);
      optimizeResults.push({
        file: path.relative(__dirname, outputPath),
        orig: Math.round(origSize / 1024),
        new: Math.round(newSize / 1024),
        saving
      });
    } catch (e) {
      console.error(`  SKIP: ${path.relative(__dirname, imgPath)} - ${e.message}`);
    }
  }

  // ============ Summary ============
  console.log('\n=== Summary ===');
  console.log(`Downloaded: ${downloaded.length} images`);
  console.log(`Optimized: ${optimizeResults.length} images`);
  console.log(`Total saving: ${optimizeResults.reduce((s, r) => s + (r.orig - r.new), 0)}KB`);
  for (const r of optimizeResults) {
    console.log(`  ${r.file}: ${r.orig}KB -> ${r.new}KB (${r.saving}%)`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });