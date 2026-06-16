/**
 * Downloads all city gallery images from Unsplash and saves them locally.
 * Run: node frontend/scripts/download-city-photos.js
 * Output: frontend/public/cities/<city-slug>.jpg
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'cities');

const CITY_PHOTOS = [
  { slug: 'lisbon',       src: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=900&q=80' },
  { slug: 'tokyo',        src: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=80' },
  { slug: 'barcelona',    src: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=900&q=80' },
  { slug: 'new-york',     src: 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=900&q=80' },
  { slug: 'rio',          src: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=900&q=80' },
  { slug: 'bangkok',      src: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=900&q=80' },
  { slug: 'giza',         src: 'https://images.unsplash.com/photo-1539768942893-daf53e448371?auto=format&fit=crop&w=900&q=80' },
  { slug: 'beijing',      src: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=900&q=80' },
  { slug: 'rome',         src: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=900&q=80' },
  { slug: 'oslo',         src: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80' },
  { slug: 'paris',        src: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80' },
  { slug: 'marrakech',    src: 'https://images.unsplash.com/photo-1637531114994-ef00c3f54387?auto=format&fit=crop&w=900&q=80' },
  { slug: 'santorini',    src: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=900&q=80' },
  { slug: 'london',       src: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80' },
  { slug: 'dubai',        src: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80' },
  { slug: 'sydney',       src: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=900&q=80' },
  { slug: 'new-delhi',    src: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=900&q=80' },
  { slug: 'riyadh',       src: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=900&q=80' },
  { slug: 'cusco',        src: 'https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?auto=format&fit=crop&w=900&q=80' },
  { slug: 'istanbul',     src: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=900&q=80' },
];

const HTTPS_AGENT = new https.Agent({ rejectUnauthorized: false });

function download(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const isHttps = url.startsWith('https');
    const protocol = isHttps ? https : http;
    const options = isHttps ? { agent: HTTPS_AGENT } : {};

    const request = protocol.get(url, options, (res) => {
      // Follow redirects (Unsplash sends 301/302)
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        try { fs.unlinkSync(destPath); } catch {}
        download(res.headers.location, destPath).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }

      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    });

    request.on('error', (err) => {
      fs.unlinkSync(destPath);
      reject(err);
    });

    // 30s timeout per image
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error(`Timeout downloading ${url}`));
    });
  });
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created: ${OUTPUT_DIR}`);
  }

  console.log(`\nDownloading ${CITY_PHOTOS.length} city photos...\n`);

  const results = { ok: [], failed: [] };

  for (const { slug, src } of CITY_PHOTOS) {
    const dest = path.join(OUTPUT_DIR, `${slug}.jpg`);

    if (fs.existsSync(dest)) {
      console.log(`  SKIP  ${slug}.jpg (already exists)`);
      results.ok.push(slug);
      continue;
    }

    try {
      process.stdout.write(`  GET   ${slug}.jpg ... `);
      await download(src, dest);
      const size = (fs.statSync(dest).size / 1024).toFixed(0);
      console.log(`OK (${size} KB)`);
      results.ok.push(slug);
    } catch (err) {
      console.log(`FAIL — ${err.message}`);
      results.failed.push(slug);
    }
  }

  console.log(`\nDone: ${results.ok.length} saved, ${results.failed.length} failed.`);

  if (results.failed.length > 0) {
    console.log('Failed:', results.failed.join(', '));
    process.exit(1);
  }
}

main();
