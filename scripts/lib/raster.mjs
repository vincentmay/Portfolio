/** Minimal PNG writing and point-cloud splatting. Build-time tooling only. */

import { deflateSync } from "node:zlib";

const CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "latin1"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

/** `channels` is 1 for greyscale, 3 for RGB. */
export function png(width, height, pixels, channels = 1) {
  const stride = width * channels;
  const raw = Buffer.alloc(height * (stride + 1));
  const src = Buffer.from(pixels.buffer, pixels.byteOffset, pixels.length);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    src.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = channels === 3 ? 2 : 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const FOV = 42;
const CAM = 3.05;

/**
 * Additive splat of a point cloud with the same framing and tone curve the
 * shader uses, so previews are a fair likeness of what ships.
 */
export function render(positions, count, options = {}) {
  const { yaw = 0, width = 520, height = width, scale = 1, exposure = 1.5, gain = 0.55 } = options;
  const acc = new Float32Array(width * height);
  const f = ((height / 2) / Math.tan((FOV / 2) * (Math.PI / 180))) * scale;
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);

  for (let p = 0; p < count; p++) {
    const x0 = positions[p * 3];
    const y0 = positions[p * 3 + 1];
    const z0 = positions[p * 3 + 2];
    const x = x0 * cy + z0 * sy;
    const z = -x0 * sy + z0 * cy;

    const w = CAM - z;
    if (w <= 0.05) continue;
    const sx = width / 2 + (x / w) * f;
    const sy2 = height / 2 - (y0 / w) * f;
    const radius = Math.max(0.7, (0.0075 / w) * f);
    const g = gain / (w * w);

    const x1 = Math.max(0, Math.floor(sx - radius));
    const x2 = Math.min(width - 1, Math.ceil(sx + radius));
    const y1 = Math.max(0, Math.floor(sy2 - radius));
    const y2 = Math.min(height - 1, Math.ceil(sy2 + radius));
    for (let py = y1; py <= y2; py++) {
      for (let px = x1; px <= x2; px++) {
        const dx = (px + 0.5 - sx) / radius;
        const dy = (py + 0.5 - sy2) / radius;
        const d2 = dx * dx + dy * dy;
        if (d2 > 1) continue;
        acc[py * width + px] += Math.exp(-d2 * 3.2) * g;
      }
    }
  }

  const out = new Uint8Array(width * height);
  for (let i = 0; i < out.length; i++) {
    out[i] = Math.round(Math.min(1, Math.max(0, 1 - Math.exp(-acc[i] * exposure))) * 255);
  }
  return out;
}

/** Lay square frames out in a row. */
export function sheet(frames, cell) {
  const w = cell * frames.length;
  const out = new Uint8Array(w * cell);
  frames.forEach((frame, k) => {
    for (let y = 0; y < cell; y++) {
      out.set(frame.subarray(y * cell, (y + 1) * cell), y * w + k * cell);
    }
  });
  return { pixels: out, width: w, height: cell };
}

/** Greyscale to RGB with a warm cast, matching the composite pass. */
export function tint(grey, warm = [1.0, 0.988, 0.945]) {
  const out = new Uint8Array(grey.length * 3);
  for (let i = 0; i < grey.length; i++) {
    out[i * 3] = Math.min(255, Math.round(grey[i] * warm[0]));
    out[i * 3 + 1] = Math.min(255, Math.round(grey[i] * warm[1]));
    out[i * 3 + 2] = Math.min(255, Math.round(grey[i] * warm[2]));
  }
  return out;
}
