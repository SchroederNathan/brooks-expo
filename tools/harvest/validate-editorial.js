/**
 * Fail the harvest when an app-authored Brooks editorial URL does not return
 * image bytes. CMS paths can return a slow HTML Akamai denial with HTTP 200;
 * checking only status would let the bad source reach both apps.
 *
 * @ref LLP 0002#the-image-cdn — Product photography uses the public image CDN;
 * CMS editorial candidates must prove the same app-client reachability before
 * they enter the committed prototype.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const SOURCES = [
  path.join(ROOT, 'apps', 'expo', 'src', 'data', 'editorial.ts'),
  path.join(ROOT, 'apps', 'exact', 'src', 'app', 'routes', 'index.contract'),
];
const URL_PATTERN = /https:\/\/www\.brooksrunning\.com\/[^"'`\s)]+/g;
const MAX_PREFIX_BYTES = 64;
const REQUEST_TIMEOUT_MS = 15_000;

function hasImageSignature(bytes) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return true;
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return true;
  }
  const ascii = Buffer.from(bytes).toString('ascii');
  return ascii.startsWith('GIF8') || (ascii.startsWith('RIFF') && ascii.slice(8, 12) === 'WEBP');
}

async function readPrefix(response) {
  const reader = response.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks = [];
  let length = 0;
  try {
    while (length < MAX_PREFIX_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      const remaining = MAX_PREFIX_BYTES - length;
      const chunk = value.subarray(0, remaining);
      chunks.push(chunk);
      length += chunk.length;
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  const prefix = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    prefix.set(chunk, offset);
    offset += chunk.length;
  }
  return prefix;
}

async function validate(url) {
  // App call sites add these resize parameters through brooksImage(). Bare
  // `/dw/image/v2/` masters can themselves return an HTML denial, so validate
  // the exact public CDN shape the app will request rather than the stored key.
  const requestUrl = new URL(url);
  if (requestUrl.pathname.includes('/dw/image/v2/')) {
    requestUrl.search = new URLSearchParams({
      sw: '64',
      sh: '64',
      sm: 'cut',
      sfrm: 'png',
      strip: 'false',
      bgcolor: 'F8F8F8',
    }).toString();
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(requestUrl, {
      headers: { Range: `bytes=0-${MAX_PREFIX_BYTES - 1}` },
      redirect: 'follow',
      signal: controller.signal,
    });
    const contentType = response.headers.get('content-type')?.split(';', 1)[0].trim() ?? '';
    const prefix = await readPrefix(response);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    if (!contentType.startsWith('image/')) throw new Error(`Content-Type ${contentType || '<missing>'}`);
    if (!hasImageSignature(prefix)) throw new Error('body does not start with a supported image signature');
    return contentType;
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  const urls = new Set();
  for (const source of SOURCES) {
    const text = fs.readFileSync(source, 'utf8');
    for (const match of text.matchAll(URL_PATTERN)) urls.add(match[0]);
  }

  if (urls.size === 0) throw new Error('No Brooks editorial image URLs found');

  const failures = [];
  for (const url of [...urls].sort()) {
    try {
      const contentType = await validate(url);
      console.log(`✓ ${contentType} ${url}`);
    } catch (error) {
      failures.push(`${url}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (failures.length > 0) {
    throw new Error(`Editorial image validation failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
