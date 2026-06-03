import { PDFDocument, rgb, degrees } from 'pdf-lib';
import { ImageFile, PDFSettings, CustomMargin } from '../types';

// Page sizes in Points (1 inch = 72 points)
const PAGE_SIZES = {
  A4: { width: 595.28, height: 841.89 },
  A3: { width: 841.89, height: 1190.55 },
  A5: { width: 419.53, height: 595.28 },
  Letter: { width: 612, height: 792 },
  Legal: { width: 612, height: 1008 },
};

const getMargins = (type: string, custom: CustomMargin): CustomMargin => {
  switch (type) {
    case 'None':
      return { top: 0, bottom: 0, left: 0, right: 0 };
    case 'Small':
      return { top: 12, bottom: 12, left: 12, right: 12 };
    case 'Medium':
      return { top: 24, bottom: 24, left: 24, right: 24 };
    case 'Large':
      return { top: 36, bottom: 36, left: 36, right: 36 };
    case 'Custom':
      return custom;
    default:
      return { top: 0, bottom: 0, left: 0, right: 0 };
  }
};

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : { r: 0.5, g: 0.5, b: 0.5 };
};

/**
 * Preprocesses an image using canvas to compress/convert it to JPEG/PNG format.
 */
const preprocessImage = (
  imgFile: ImageFile,
  compression: 'High' | 'Balanced' | 'Small'
): Promise<{ data: Uint8Array; type: 'jpeg' | 'png' }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || imgFile.width || 800;
        canvas.height = img.naturalHeight || imgFile.height || 600;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get 2D canvas context'));
          return;
        }

        // Fill white background (useful for transparent images when converting to JPEG)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        // Compression Quality maps to JPEG quality parameters
        let quality = 0.85;
        if (compression === 'High') quality = 0.95;
        if (compression === 'Small') quality = 0.45;

        // Clean conversion
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas compression failed'));
              return;
            }
            const fileReader = new FileReader();
            fileReader.onload = () => {
              const arrayBuffer = fileReader.result as ArrayBuffer;
              resolve({
                data: new Uint8Array(arrayBuffer),
                type: 'jpeg',
              });
            };
            fileReader.onerror = () => reject(new Error('Blob read error'));
            fileReader.readAsArrayBuffer(blob);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error(`Failed to load image: ${imgFile.name}`));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error(`Failed to read file: ${imgFile.name}`));
    reader.readAsDataURL(imgFile.file);
  });
};

export interface GeneratePDFArgs {
  images: ImageFile[];
  settings: PDFSettings;
  onProgress: (phase: 'preparing' | 'compressing' | 'compiling' | 'saving', step: number, total: number, msg: string) => void;
  getIsCancelled: () => boolean;
}

export async function generatePDF({
  images,
  settings,
  onProgress,
  getIsCancelled,
}: GeneratePDFArgs): Promise<Uint8Array | null> {
  const { pageSize, orientation, marginType, customMargin, scaling, compression, watermark } = settings;
  const numImages = images.length;

  if (numImages === 0) {
    throw new Error('No images selected for conversion.');
  }

  // 1. Preparing Phase
  if (getIsCancelled()) return null;
  onProgress('preparing', 0, numImages, 'Preparing images for layout...');

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();

  // 2. Compression & Processing Phase
  const processedImages: { data: Uint8Array; type: 'jpeg' | 'png'; width: number; height: number; name: string }[] = [];
  
  for (let i = 0; i < numImages; i++) {
    if (getIsCancelled()) return null;
    const imgFile = images[i];
    onProgress('compressing', i, numImages, `Optimizing image ${i + 1} of ${numImages}: ${imgFile.name}`);

    try {
      const processed = await preprocessImage(imgFile, compression);
      processedImages.push({
        ...processed,
        width: imgFile.width || 800,
        height: imgFile.height || 600,
        name: imgFile.name,
      });
    } catch (err) {
      console.error(err);
      // Fallback: embed the raw file if canvas fails (supports direct JPEG/PNG reading)
      if (getIsCancelled()) return null;
      const buffer = await imgFile.file.arrayBuffer();
      const isPng = imgFile.type === 'image/png' || imgFile.name.toLowerCase().endsWith('.png');
      processedImages.push({
        data: new Uint8Array(buffer),
        type: isPng ? 'png' : 'jpeg',
        width: imgFile.width || 800,
        height: imgFile.height || 600,
        name: imgFile.name,
      });
    }
  }

  // 3. Compiling PDF Pages
  if (getIsCancelled()) return null;
  onProgress('compiling', 0, numImages, 'Compiling layouts and drawing graphics...');

  const margins = getMargins(marginType, customMargin);

  for (let i = 0; i < numImages; i++) {
    if (getIsCancelled()) return null;
    onProgress('compiling', i, numImages, `Layout positioning ${i + 1} of ${numImages}...`);

    const imgData = processedImages[i];
    let pageW = 595.28; // Default A4 Width
    let pageH = 841.89; // Default A4 Height

    // A. Calculate Page Dimensions
    if (pageSize === 'Original') {
      pageW = imgData.width + margins.left + margins.right;
      pageH = imgData.height + margins.top + margins.bottom;
    } else {
      const baseSize = PAGE_SIZES[pageSize as keyof typeof PAGE_SIZES] || PAGE_SIZES.A4;
      pageW = baseSize.width;
      pageH = baseSize.height;

      // Swap if landscape, or determine is Auto needed
      let isLandscape = false;
      if (orientation === 'Landscape') {
        isLandscape = true;
      } else if (orientation === 'Auto') {
        // Match image aspect ratio
        isLandscape = imgData.width > imgData.height;
      }

      if (isLandscape) {
        pageW = baseSize.height;
        pageH = baseSize.width;
      }
    }

    // Embed Image to PDF
    let embeddedImg;
    if (imgData.type === 'png') {
      embeddedImg = await pdfDoc.embedPng(imgData.data);
    } else {
      embeddedImg = await pdfDoc.embedJpg(imgData.data);
    }

    // Add page
    const page = pdfDoc.addPage([pageW, pageH]);

    // B. Drawing calculations inside margins
    const printableW = pageW - margins.left - margins.right;
    const printableH = pageH - margins.top - margins.bottom;

    let drawW = printableW;
    let drawH = printableH;
    let drawX = margins.left;
    let drawY = margins.bottom;

    const imgAspect = imgData.width / imgData.height;
    const printAspect = printableW / printableH;

    if (scaling === 'Fit') {
      if (imgAspect > printAspect) {
        drawW = printableW;
        drawH = printableW / imgAspect;
      } else {
        drawH = printableH;
        drawW = printableH * imgAspect;
      }
      // Center image inside printable area
      drawX += (printableW - drawW) / 2;
      drawY += (printableH - drawH) / 2;
    } else if (scaling === 'Fill') {
      if (imgAspect > printAspect) {
        drawH = printableH;
        drawW = printableH * imgAspect;
      } else {
        drawW = printableW;
        drawH = printableW / imgAspect;
      }
      // Center and let it overflow printable borders
      drawX += (printableW - drawW) / 2;
      drawY += (printableH - drawH) / 2;
    } else if (scaling === 'Stretch') {
      drawW = printableW;
      drawH = printableH;
    } else if (scaling === 'Original') {
      drawW = imgData.width;
      drawH = imgData.height;
      // Center
      drawX += (printableW - drawW) / 2;
      drawY += (printableH - drawH) / 2;
    }

    // Clip to printable bounds if Fit/Fill/Original overflow page boundaries
    // Let's use simple clipping if needed or just let pdf-lib handle the drawing coordinates safely
    page.drawImage(embeddedImg, {
      x: drawX,
      y: drawY,
      width: drawW,
      height: drawH,
    });

    // C. Watermark Layer
    if (watermark.enabled && watermark.text) {
      const { r, g, b } = hexToRgb(watermark.color);
      page.drawText(watermark.text, {
        x: pageW / 2,
        y: pageH / 2,
        size: watermark.fontSize,
        opacity: watermark.opacity,
        color: rgb(r, g, b),
        rotate: degrees(watermark.rotation),
      });
    }
  }

  // 4. Save & Finalize
  if (getIsCancelled()) return null;
  onProgress('saving', 0, 100, 'Writing PDF file stream...');

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
