const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const standaloneDir = path.join(rootDir, '.next', 'standalone');

if (fs.existsSync(standaloneDir)) {
  console.log('📦 Đang tối ưu hóa và sao chép tài nguyên tĩnh vào Standalone...');
  
  // Copy public directory
  const publicDir = path.join(rootDir, 'public');
  const standalonePublic = path.join(standaloneDir, 'public');
  if (fs.existsSync(publicDir)) {
    fs.cpSync(publicDir, standalonePublic, { recursive: true });
  }

  // Copy .next/static directory
  const staticDir = path.join(rootDir, '.next', 'static');
  const standaloneStatic = path.join(standaloneDir, '.next', 'static');
  if (fs.existsSync(staticDir)) {
    fs.cpSync(staticDir, standaloneStatic, { recursive: true });
  }

  console.log('✅ Đã tối ưu Standalone siêu nhẹ thành công!');
}
