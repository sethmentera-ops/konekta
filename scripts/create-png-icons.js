import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPng(width, height, r, g, b) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8);
  ihdrData.writeUInt8(2, 9);
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);
  const ihdr = makeChunk('IHDR', ihdrData);

  const rowBytes = width * 3;
  const rawData = Buffer.alloc(height * (rowBytes + 1));
  for (let y = 0; y < height; y++) {
    const offset = y * (rowBytes + 1);
    rawData[offset] = 0;
    for (let x = 0; x < width; x++) {
      const pixelOffset = offset + 1 + x * 3;
      const isTurquoiseCenter =
        (Math.hypot(x - width * 0.35, y - height * 0.5) < width * 0.15) ||
        (Math.hypot(x - width * 0.65, y - height * 0.5) < width * 0.15);
      if (isTurquoiseCenter) {
        rawData[pixelOffset] = 87;
        rawData[pixelOffset + 1] = 215;
        rawData[pixelOffset + 2] = 242;
      } else {
        rawData[pixelOffset] = r;
        rawData[pixelOffset + 1] = g;
        rawData[pixelOffset + 2] = b;
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressedData);
  const iend = makeChunk('IEND', Buffer.alloc(0));
  return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const len = data.length;
  const buffer = Buffer.alloc(4 + 4 + len + 4);
  buffer.writeUInt32BE(len, 0);
  buffer.write(type, 4, 4, 'ascii');
  data.copy(buffer, 8);
  const crc = crc32(buffer.subarray(4, 8 + len));
  buffer.writeUInt32BE(crc >>> 0, 8 + len);
  return buffer;
}

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return c ^ 0xffffffff;
}

const pubDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir, { recursive: true });

fs.writeFileSync(path.join(pubDir, 'pwa-192x192.png'), createPng(192, 192, 16, 26, 53));
fs.writeFileSync(path.join(pubDir, 'pwa-512x512.png'), createPng(512, 512, 16, 26, 53));
fs.writeFileSync(path.join(pubDir, 'pwa-maskable-512x512.png'), createPng(512, 512, 16, 26, 53));
fs.writeFileSync(path.join(pubDir, 'apple-touch-icon.png'), createPng(180, 180, 16, 26, 53));

console.log('✅ PWA Icons successfully generated!');
