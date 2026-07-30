import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { compressImage } from '@/lib/image-compressor';
import path from 'path';
import fs from 'fs';
import { writeFile, unlink } from 'fs/promises';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { assetId, assetIds, all } = body;

    let targetAssetIds: string[] = [];

    if (assetId) {
      targetAssetIds = [assetId];
    } else if (Array.isArray(assetIds) && assetIds.length > 0) {
      targetAssetIds = assetIds;
    } else if (all) {
      const allAssets = await prisma.asset.findMany({
        select: { id: true }
      });
      targetAssetIds = allAssets.map(a => a.id);
    } else {
      return NextResponse.json({ error: 'Cần cung cấp assetId, assetIds hoặc all: true' }, { status: 400 });
    }

    let rootDir = process.cwd();
    if (rootDir.includes('.next/standalone') || rootDir.includes('.next\\standalone')) {
      rootDir = path.join(rootDir, '../../');
    }

    const results = [];
    let totalOriginalBytes = 0;
    let totalCompressedBytes = 0;

    for (const id of targetAssetIds) {
      const asset = await prisma.asset.findUnique({ where: { id } });
      if (!asset) continue;

      // Không nén SVG
      if (asset.mimeType?.includes('svg') || asset.fileName.toLowerCase().endsWith('.svg')) {
        results.push({
          id: asset.id,
          fileName: asset.fileName,
          status: 'skipped',
          reason: 'File SVG không cần nén'
        });
        continue;
      }

      // Xóa query param nếu có trong url
      const cleanUrl = asset.url.split('?')[0];
      const relativePath = cleanUrl.startsWith('/') ? cleanUrl.slice(1) : cleanUrl;
      const fullPath = path.join(rootDir, 'public', relativePath);

      if (!fs.existsSync(fullPath)) {
        results.push({
          id: asset.id,
          fileName: asset.fileName,
          status: 'error',
          reason: `Không tìm thấy file trên đĩa tại ${fullPath}`
        });
        continue;
      }

      const fileBuffer = fs.readFileSync(fullPath);
      const originalSize = fileBuffer.length;
      totalOriginalBytes += originalSize;

      const compressedResult = await compressImage(fileBuffer, asset.fileName, asset.mimeType);

      if (compressedResult.error) {
        results.push({
          id: asset.id,
          fileName: asset.fileName,
          status: 'error',
          reason: compressedResult.error,
          originalSize,
          compressedSize: originalSize
        });
        continue;
      }

      if (compressedResult.sizeBytes >= originalSize * 0.98) {
        totalCompressedBytes += originalSize;
        results.push({
          id: asset.id,
          fileName: asset.fileName,
          status: 'skipped',
          reason: 'Ảnh đã ở định dạng WebP chuẩn và đã được tối ưu dung lượng tối đa',
          originalSize,
          compressedSize: originalSize
        });
        continue;
      }

      // Đường dẫn file mới sau khi nén
      const dirName = path.dirname(fullPath);
      const ext = path.extname(fullPath);
      const baseName = path.basename(fullPath, ext);
      const newFileNameOnDisk = `${baseName}.webp`;
      const newFullPath = path.join(dirName, newFileNameOnDisk);

      // Lưu file nén
      await writeFile(newFullPath, compressedResult.buffer);

      // Nếu đổi extension từ .png/.jpg sang .webp và file mới khác file cũ thì xóa file cũ
      if (fullPath !== newFullPath && fs.existsSync(fullPath)) {
        try {
          await unlink(fullPath);
        } catch (e) {
          console.warn('Could not remove original file:', e);
        }
      }

      // Đổi URL trong DB tương ứng
      const oldUrl = asset.url;
      const newUrl = oldUrl.replace(/\.[^.]+$/, '.webp');
      const newFileName = asset.fileName.replace(/\.[^.]+$/, '.webp');

      const updatedAsset = await prisma.asset.update({
        where: { id: asset.id },
        data: {
          url: newUrl,
          fileName: newFileName,
          mimeType: 'image/webp',
          sizeBytes: compressedResult.sizeBytes
        }
      });

      totalCompressedBytes += compressedResult.sizeBytes;
      const savedBytes = originalSize - compressedResult.sizeBytes;
      const percent = Math.round((savedBytes / originalSize) * 100);

      results.push({
        id: updatedAsset.id,
        fileName: updatedAsset.fileName,
        status: 'success',
        originalSize,
        compressedSize: compressedResult.sizeBytes,
        savedBytes,
        percentSaved: percent,
        newUrl: updatedAsset.url
      });
    }

    const totalSavedBytes = totalOriginalBytes - totalCompressedBytes;
    const totalPercentSaved = totalOriginalBytes > 0 ? Math.round((totalSavedBytes / totalOriginalBytes) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        results,
        summary: {
          processedCount: results.filter(r => r.status === 'success').length,
          totalOriginalBytes,
          totalCompressedBytes,
          totalSavedBytes,
          totalPercentSaved
        }
      }
    });

  } catch (error: any) {
    console.error('Compress API error:', error);
    return NextResponse.json({
      error: 'Lỗi nén ảnh',
      details: error?.message || String(error)
    }, { status: 500 });
  }
}
