const fs = require('fs');
const path = require('path');

const pngPath = path.join(__dirname, '..', 'icon.png');
const icoPath = path.join(__dirname, '..', 'icon.ico');

try {
  const pngData = fs.readFileSync(pngPath);
  const size = pngData.length;

  const buffer = Buffer.alloc(22 + size);
  
  // ICONHEADER
  buffer.writeUInt16LE(0, 0);  // Reserved
  buffer.writeUInt16LE(1, 2);  // Type (1 = ICO)
  buffer.writeUInt16LE(1, 4);  // Count (1 image)

  // ICONDIRENTRY
  buffer.writeUInt8(0, 6);     // Width (0 means 256)
  buffer.writeUInt8(0, 7);     // Height (0 means 256)
  buffer.writeUInt8(0, 8);     // Color count (0)
  buffer.writeUInt8(0, 9);     // Reserved (0)
  buffer.writeUInt16LE(1, 10); // Color planes (1)
  buffer.writeUInt16LE(32, 12);// Bits per pixel (32)
  buffer.writeUInt32LE(size, 14); // Image size in bytes
  buffer.writeUInt32LE(22, 18); // Image data offset (22)

  // Raw PNG data
  pngData.copy(buffer, 22);

  fs.writeFileSync(icoPath, buffer);
  console.log('Arquivo icon.ico criado com sucesso em:', icoPath);
} catch (error) {
  console.error('Erro ao converter PNG para ICO:', error.message);
  process.exit(1);
}
