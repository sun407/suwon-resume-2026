import * as mpSelfieSegmentation from '@mediapipe/selfie_segmentation';

export type StudioBackgroundType = 'blue' | 'white' | 'gray' | 'warm';

export interface StudioBackgroundOption {
  id: StudioBackgroundType;
  label: string;
  desc: string;
  previewHex: string;
  gradientTop: string;
  gradientCenter: string;
  gradientEdge: string;
}

export const BACKGROUND_OPTIONS: StudioBackgroundOption[] = [
  {
    id: 'blue',
    label: '스튜디오 블루',
    desc: '표준 증명사진 하늘색',
    previewHex: '#dbeafe',
    gradientTop: '#eff6ff',
    gradientCenter: '#dbeafe',
    gradientEdge: '#bfdbfe',
  },
  {
    id: 'white',
    label: '깔끔한 화이트',
    desc: '여권/공공기관 표준',
    previewHex: '#ffffff',
    gradientTop: '#ffffff',
    gradientCenter: '#f8fafc',
    gradientEdge: '#e2e8f0',
  },
  {
    id: 'gray',
    label: '모던 그레이',
    desc: '차분하고 단정한 회색',
    previewHex: '#e2e8f0',
    gradientTop: '#f1f5f9',
    gradientCenter: '#e2e8f0',
    gradientEdge: '#cbd5e1',
  },
  {
    id: 'warm',
    label: '따뜻한 아이보리',
    desc: '부드럽고 친근한 미색',
    previewHex: '#fef3c7',
    gradientTop: '#fffbeb',
    gradientCenter: '#fef3c7',
    gradientEdge: '#fde68a',
  },
];

let segmenterInstance: mpSelfieSegmentation.SelfieSegmentation | null = null;

async function getSegmenter(): Promise<mpSelfieSegmentation.SelfieSegmentation> {
  if (segmenterInstance) return segmenterInstance;

  const SelfieSegmentationCtor =
    (mpSelfieSegmentation as any).SelfieSegmentation ||
    (window as any).SelfieSegmentation;

  if (!SelfieSegmentationCtor) {
    throw new Error('SelfieSegmentation module could not be loaded.');
  }

  const segmenter = new SelfieSegmentationCtor({
    locateFile: (file: string) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
  }) as mpSelfieSegmentation.SelfieSegmentation;

  segmenter.setOptions({
    modelSelection: 1,
    selfieMode: false,
  });

  segmenterInstance = segmenter;
  return segmenter;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('이미지를 불러오는데 실패했습니다.'));
    img.src = src;
  });
}

function drawStudioBackdrop(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bgType: StudioBackgroundType
) {
  const option =
    BACKGROUND_OPTIONS.find((opt) => opt.id === bgType) || BACKGROUND_OPTIONS[0];

  const grad = ctx.createRadialGradient(
    width * 0.5,
    height * 0.35,
    width * 0.08,
    width * 0.5,
    height * 0.45,
    Math.max(width, height) * 0.78
  );
  grad.addColorStop(0, option.gradientTop);
  grad.addColorStop(0.55, option.gradientCenter);
  grad.addColorStop(1, option.gradientEdge);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Replaces the background of a portrait photo with a clean Korean ID photo studio backdrop.
 * Uses MediaPipe SelfieSegmentation locally in the browser (WASM).
 */
export async function replacePhotoBackground(
  imageSrc: string,
  bgType: StudioBackgroundType
): Promise<string> {
  const img = await loadImage(imageSrc);

  // Target crisp Korean standard 3:4 ID photo proportions
  const targetWidth = 450;
  const targetHeight = 600;

  // Prepare centered 3:4 cropped source canvas
  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = targetWidth;
  srcCanvas.height = targetHeight;
  const srcCtx = srcCanvas.getContext('2d');
  if (!srcCtx) throw new Error('Canvas 2D context unavailable.');

  const srcAspect = img.width / img.height;
  const dstAspect = targetWidth / targetHeight;

  let drawW = img.width;
  let drawH = img.height;
  let offsetX = 0;
  let offsetY = 0;

  if (srcAspect > dstAspect) {
    drawW = img.height * dstAspect;
    offsetX = (img.width - drawW) / 2;
  } else {
    drawH = img.width / dstAspect;
    offsetY = Math.max(0, (img.height - drawH) * 0.25);
  }

  srcCtx.drawImage(
    img,
    offsetX,
    offsetY,
    drawW,
    drawH,
    0,
    0,
    targetWidth,
    targetHeight
  );

  try {
    const segmenter = await getSegmenter();

    const maskCanvas = await new Promise<HTMLCanvasElement>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Segmentation timed out'));
      }, 12000);

      segmenter.onResults((results) => {
        clearTimeout(timeout);
        const mask = document.createElement('canvas');
        mask.width = targetWidth;
        mask.height = targetHeight;
        const mCtx = mask.getContext('2d');
        if (!mCtx) {
          reject(new Error('Mask context unavailable'));
          return;
        }
        // Slight feathering for natural hair/shoulder edges
        mCtx.filter = 'blur(1.5px)';
        mCtx.drawImage(results.segmentationMask, 0, 0, targetWidth, targetHeight);
        resolve(mask);
      });

      segmenter.send({ image: srcCanvas }).catch((err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });

    // Extract foreground person using destination-in mask
    const fgCanvas = document.createElement('canvas');
    fgCanvas.width = targetWidth;
    fgCanvas.height = targetHeight;
    const fgCtx = fgCanvas.getContext('2d');
    if (!fgCtx) throw new Error('Foreground context unavailable');

    fgCtx.drawImage(srcCanvas, 0, 0);
    fgCtx.globalCompositeOperation = 'destination-in';
    fgCtx.drawImage(maskCanvas, 0, 0);
    fgCtx.globalCompositeOperation = 'source-over';

    // Composite Studio Background + Foreground Person
    const outCanvas = document.createElement('canvas');
    outCanvas.width = targetWidth;
    outCanvas.height = targetHeight;
    const outCtx = outCanvas.getContext('2d');
    if (!outCtx) throw new Error('Output context unavailable');

    drawStudioBackdrop(outCtx, targetWidth, targetHeight, bgType);
    outCtx.drawImage(fgCanvas, 0, 0);

    return outCanvas.toDataURL('image/jpeg', 0.92);
  } catch (err) {
    console.warn('MediaPipe segmentation fallback applied:', err);
    // Graceful studio vignette fallback
    const fallbackCanvas = document.createElement('canvas');
    fallbackCanvas.width = targetWidth;
    fallbackCanvas.height = targetHeight;
    const fCtx = fallbackCanvas.getContext('2d');
    if (!fCtx) return srcCanvas.toDataURL('image/jpeg', 0.92);

    drawStudioBackdrop(fCtx, targetWidth, targetHeight, bgType);
    fCtx.save();
    fCtx.globalAlpha = 0.96;
    fCtx.drawImage(srcCanvas, 0, 0);
    fCtx.restore();
    return fallbackCanvas.toDataURL('image/jpeg', 0.92);
  }
}
