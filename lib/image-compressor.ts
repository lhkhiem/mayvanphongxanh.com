import path from 'path';

export interface CompressionResult {
  buffer: Buffer;
  format: string;
  mimeType: string;
  extension: string;
  fileName: string;
  sizeBytes: number;
  compressed: boolean;
  originalSize: number;
}

/**
 * Thử nạp module Sharp một cách an toàn để tránh crash ứng dụng khi deploy VPS
 * (ví dụ do khác biệt hệ điều hành Windows/Linux C++ native bindings hay thiếu libvips).
 */
async function getSharp() {
  try {
    const sharpModule = await import('sharp');
    return sharpModule.default || sharpModule;
  } catch (error) {
    console.warn('[ImageCompressor] Sharp native C++ module không khả dụng trên VPS, fallback dùng file gốc:', error);
    return null;
  }
}

/**
 * Tự động nén và tối ưu hóa hình ảnh bằng Sharp:
 * - Giữ nguyên SVG.
 * - Với ảnh tĩnh (PNG, JPG, WEBP, GIF, BMP...):
 *   + Giới hạn kích thước tối đa 1920px (chiều rộng/chiều cao, giữ đúng tỉ lệ hình).
 *   + Chuyển đổi sang định dạng WebP chuẩn với chất lượng 80%.
 *   + Tiết kiệm 70% - 90% dung lượng mà chất lượng hình ảnh không bị giảm khi hiển thị.
 *   + Tự động fallback giữ file gốc an toàn nếu VPS thiếu C++ bindings của Sharp.
 */
export async function compressImage(
  inputBuffer: Buffer,
  originalFileName: string,
  originalMimeType?: string
): Promise<CompressionResult> {
  const originalSize = inputBuffer.length;
  const isSvg = originalMimeType?.includes('svg') || originalFileName.toLowerCase().endsWith('.svg');

  if (isSvg) {
    return {
      buffer: inputBuffer,
      format: 'svg',
      mimeType: 'image/svg+xml',
      extension: '.svg',
      fileName: originalFileName,
      sizeBytes: originalSize,
      compressed: false,
      originalSize,
    };
  }

  const ext = path.extname(originalFileName) || '.jpg';
  const baseName = path
    .basename(originalFileName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'image';

  try {
    const sharp = await getSharp();

    // Nếu hệ thống VPS không nạp được Sharp native module, fallback sử dụng file gốc an toàn tuyệt đối
    if (!sharp) {
      return {
        buffer: inputBuffer,
        format: ext.replace('.', '') || 'jpg',
        mimeType: originalMimeType || 'image/jpeg',
        extension: ext,
        fileName: originalFileName,
        sizeBytes: originalSize,
        compressed: false,
        originalSize,
      };
    }

    const sharpInstance = sharp(inputBuffer);

    // Lấy metadata của ảnh để kiểm tra kích thước gốc
    const metadata = await sharpInstance.metadata();

    let pipeline = sharp(inputBuffer);

    // Nếu ảnh rộng hoặc cao hơn 1920px, thu nhỏ lại max 1920px
    if ((metadata.width && metadata.width > 1920) || (metadata.height && metadata.height > 1920)) {
      pipeline = pipeline.resize({
        width: 1920,
        height: 1920,
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Nén sang dạng WebP chất lượng 80
    const compressedBuffer = await pipeline.webp({ quality: 80, effort: 4 }).toBuffer();

    return {
      buffer: compressedBuffer,
      format: 'webp',
      mimeType: 'image/webp',
      extension: '.webp',
      fileName: `${baseName}.webp`,
      sizeBytes: compressedBuffer.length,
      compressed: true,
      originalSize,
    };
  } catch (error) {
    console.warn(`[ImageCompressor] Nén ảnh ${originalFileName} bằng Sharp thất bại, tự động sử dụng file gốc:`, error);
    return {
      buffer: inputBuffer,
      format: ext.replace('.', '') || 'jpg',
      mimeType: originalMimeType || 'image/jpeg',
      extension: ext,
      fileName: originalFileName,
      sizeBytes: originalSize,
      compressed: false,
      originalSize,
    };
  }
}
