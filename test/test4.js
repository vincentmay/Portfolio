const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let zOff = 0;
const imageData = ctx.createImageData(canvas.width, canvas.height);
const data = imageData.data;

function noiseWarp(x, y = 0, z = 0) {
  const warpScale = 0.25;
  const warpIntensity = 5;

  const warpedX = x + warpIntensity * noise(x * warpScale, y * warpScale, z * warpScale);
  const warpedY = y + warpIntensity * noise(x * warpScale + 100, y * warpScale + 200, z * warpScale + 300);
  const warpedZ = z + warpIntensity * noise(x * warpScale + 400, y * warpScale + 500, z * warpScale + 600);

  return noise(warpedX, warpedY, warpedZ);
}

function updateField(pixelIndex) {
  let yOff = 0;
  for (let y = 0; y < canvas.height; y++) {
    let xOff = 0;
    for (let x = 0; x < canvas.width; x++) {
      const color = noiseWarp(xOff, yOff, zOff);

      data[pixelIndex++] = color * 50;
      data[pixelIndex++] = color * 255;
      data[pixelIndex++] = color * 255;
      data[pixelIndex++] = 255;

      xOff += 0.015;
    }
    yOff += 0.015;
  }

  ctx.putImageData(imageData, 0, 0)
}

/* function animate() {
  requestAnimationFrame(animate);
  let pixelIndex = 0;

  updateField(pixelIndex);

  zOff += 0.025;
}

animate(); */

updateField(0);