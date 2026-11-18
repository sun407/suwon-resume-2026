import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  Upload,
  Trash2,
  User,
  RefreshCw,
  X,
  Check,
  Image as ImageIcon,
  Clock,
  Sparkles,
  Palette,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import {
  replacePhotoBackground,
  BACKGROUND_OPTIONS,
  StudioBackgroundType,
} from '../utils/backgroundReplacer';

interface PhotoUploaderProps {
  photoUrl: string | null;
  photoUploadedAt?: string | null;
  onChangePhoto: (url: string | null) => void;
  highContrast?: boolean;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  photoUrl,
  photoUploadedAt,
  onChangePhoto,
  highContrast = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Camera Modal State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [originalCapturedImage, setOriginalCapturedImage] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Background Processing State
  const [isProcessingBg, setIsProcessingBg] = useState(false);
  const [selectedBgInCamera, setSelectedBgInCamera] = useState<StudioBackgroundType | null>(null);

  // Standalone Background Editor Modal State (for existing/uploaded photos)
  const [isBgEditorOpen, setIsBgEditorOpen] = useState(false);
  const [bgEditorSourceImage, setBgEditorSourceImage] = useState<string | null>(null);
  const [bgEditorPreviewImage, setBgEditorPreviewImage] = useState<string | null>(null);
  const [selectedEditorBg, setSelectedEditorBg] = useState<StudioBackgroundType>('blue');
  const [bgEditorError, setBgEditorError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async (mode: 'user' | 'environment') => {
    setCameraError(null);
    stopCameraStream();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 720 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera access failed:', err);
      setCameraError(
        '카메라 권한이 거부되었거나 사용 가능한 카메라가 없습니다. 아래 "사진 파일 선택"을 이용해 주세요.'
      );
    }
  };

  useEffect(() => {
    if (isCameraOpen && !capturedImage) {
      startCamera(facingMode);
    }
    return () => {
      if (!isCameraOpen) stopCameraStream();
    };
  }, [isCameraOpen, facingMode]);

  useEffect(() => {
    return () => stopCameraStream();
  }, []);

  const handleOpenCameraModal = () => {
    setCapturedImage(null);
    setOriginalCapturedImage(null);
    setSelectedBgInCamera(null);
    setCameraError(null);
    setIsCameraOpen(true);
  };

  const handleCloseCameraModal = () => {
    stopCameraStream();
    setIsCameraOpen(false);
    setCapturedImage(null);
    setOriginalCapturedImage(null);
    setSelectedBgInCamera(null);
  };

  const handleSnapPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 480;

    // Crop 3:4 portrait aspect ratio
    const targetRatio = 3 / 4;
    let cropW = vw;
    let cropH = vh;
    if (vw / vh > targetRatio) {
      cropW = vh * targetRatio;
    } else {
      cropH = vw / targetRatio;
    }
    const sx = (vw - cropW) / 2;
    const sy = (vh - cropH) / 2;

    canvas.width = 450;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, sx, sy, cropW, cropH, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setOriginalCapturedImage(dataUrl);
    setCapturedImage(dataUrl);
    setSelectedBgInCamera(null);
    stopCameraStream();
  };

  const handleApplyBgInCamera = async (bgType: StudioBackgroundType) => {
    const source = originalCapturedImage || capturedImage;
    if (!source) return;
    setIsProcessingBg(true);
    setSelectedBgInCamera(bgType);
    try {
      const processed = await replacePhotoBackground(source, bgType);
      setCapturedImage(processed);
    } catch (err) {
      console.error('Background replace failed:', err);
    } finally {
      setIsProcessingBg(false);
    }
  };

  const handleRestoreOriginalInCamera = () => {
    if (originalCapturedImage) {
      setCapturedImage(originalCapturedImage);
      setSelectedBgInCamera(null);
    }
  };

  const handleConfirmCapturedPhoto = () => {
    if (capturedImage) {
      onChangePhoto(capturedImage);
      handleCloseCameraModal();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 450;
        const maxH = 600;
        canvas.width = maxW;
        canvas.height = maxH;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const srcAspect = img.width / img.height;
        const dstAspect = maxW / maxH;
        let dw = img.width;
        let dh = img.height;
        let ox = 0;
        let oy = 0;
        if (srcAspect > dstAspect) {
          dw = img.height * dstAspect;
          ox = (img.width - dw) / 2;
        } else {
          dh = img.width / dstAspect;
          oy = Math.max(0, (img.height - dh) * 0.2);
        }
        ctx.drawImage(img, ox, oy, dw, dh, 0, 0, maxW, maxH);
        const compressed = canvas.toDataURL('image/jpeg', 0.9);
        onChangePhoto(compressed);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Standalone Studio Background Editor
  const handleOpenBgEditor = (src: string) => {
    setBgEditorSourceImage(src);
    setBgEditorPreviewImage(src);
    setSelectedEditorBg('blue');
    setBgEditorError(null);
    setIsBgEditorOpen(true);
    handleRunBgEditorPreview(src, 'blue');
  };

  const handleRunBgEditorPreview = async (
    src: string,
    bgType: StudioBackgroundType
  ) => {
    setIsProcessingBg(true);
    setBgEditorError(null);
    setSelectedEditorBg(bgType);
    try {
      const result = await replacePhotoBackground(src, bgType);
      setBgEditorPreviewImage(result);
    } catch (err) {
      console.error(err);
      setBgEditorError('배경 변환 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsProcessingBg(false);
    }
  };

  const handleApplyBgEditor = () => {
    if (bgEditorPreviewImage) {
      onChangePhoto(bgEditorPreviewImage);
      setIsBgEditorOpen(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3 w-full">
      {/* Photo Frame */}
      <div
        className={`relative group w-40 h-52 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition shadow-xs ${
          photoUrl
            ? 'border-emerald-500 bg-white border-solid'
            : highContrast
            ? 'border-yellow-400 bg-zinc-900'
            : 'border-[#c8c5bc] bg-white hover:border-[#7a8d7c]'
        }`}
      >
        {photoUrl ? (
          <>
            <img
              src={photoUrl}
              alt="증명사진"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
              <button
                type="button"
                onClick={() => handleOpenBgEditor(photoUrl)}
                className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-1 text-[11px] font-bold shadow-xs"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>배경 스튜디오 변환</span>
              </button>
              <button
                type="button"
                onClick={handleOpenCameraModal}
                className="w-full py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center justify-center gap-1 text-xs font-bold"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>다시 촬영</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center justify-center gap-1 text-xs font-bold"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>앨범 선택</span>
              </button>
            </div>
          </>
        ) : (
          <div className="p-3 text-center flex flex-col items-center gap-2">
            <div className="p-3 bg-[#f0f2f0] text-[#7a8d7c] rounded-full">
              <User className="w-8 h-8" />
            </div>
            <p className="text-xs font-bold text-[#4a544b]">증명사진 등록</p>
            <p className="text-[11px] text-[#8e8d88] leading-tight">
              카메라로 직접 찍거나
              <br />
              사진 파일 선택
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 w-full max-w-[280px]">
        {photoUrl && (
          <button
            type="button"
            onClick={() => handleOpenBgEditor(photoUrl)}
            className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-sm border border-blue-700"
          >
            <Palette className="w-4 h-4 text-blue-200" />
            <span>✨ 배경을 증명사진(스튜디오)으로 변경</span>
          </button>
        )}

        <div className="flex gap-2 w-full">
          <button
            type="button"
            onClick={handleOpenCameraModal}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-xs border ${
              highContrast
                ? 'bg-yellow-400 text-black border-yellow-400'
                : 'bg-[#7a8d7c] hover:bg-[#647566] text-white border-[#7a8d7c]'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>카메라 촬영</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 border ${
              highContrast
                ? 'bg-zinc-800 text-yellow-300 border-yellow-400'
                : 'bg-white hover:bg-[#f8f7f2] text-[#4a544b] border-[#e8e6df]'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-[#7a8d7c]" />
            <span>앨범/파일</span>
          </button>
        </div>
      </div>

      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="user"
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {photoUrl && (
        <button
          type="button"
          onClick={() => onChangePhoto(null)}
          className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 font-medium bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>등록된 사진 삭제</span>
        </button>
      )}

      {/* 1-Week Photo Auto-Removal Policy Notice */}
      <div
        className={`w-full max-w-[280px] p-2.5 rounded-xl text-[11px] space-y-1 border ${
          highContrast
            ? 'bg-zinc-900 border-yellow-400 text-yellow-300'
            : 'bg-[#f0f4f1] border-[#c2d6c5] text-[#2d4b33]'
        }`}
      >
        <div className="flex items-center gap-1.5 font-bold">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          <span>사진 1주일 자동 제거 안내</span>
        </div>
        <p className="text-[#4a544b] leading-tight">
          개인정보 보호와 데이터 관리를 위해 등록된 증명사진은{' '}
          <strong>1주일(7일) 후 자동 삭제</strong>됩니다.
        </p>
        {photoUrl && photoUploadedAt && (
          <div className="pt-1 border-t border-[#c2d6c5]/60 flex items-center justify-between text-[10px] font-semibold text-emerald-800">
            <span>보관 만료까지:</span>
            <span className="bg-white px-1.5 py-0.5 rounded border border-[#c2d6c5]">
              {Math.max(
                1,
                7 -
                  Math.floor(
                    (Date.now() - new Date(photoUploadedAt).getTime()) /
                      (24 * 3600 * 1000)
                  )
              )}
              일 남음
            </span>
          </div>
        )}
      </div>

      {/* LIVE CAMERA MODAL (with Studio Background Replacement) */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl flex flex-col items-center relative border border-[#e8e6df] my-auto">
            <div className="w-full flex items-center justify-between border-b border-[#e8e6df] pb-3 mb-4">
              <div className="flex items-center gap-2 text-[#4a544b]">
                <div className="p-2 bg-[#f0f2f0] text-[#7a8d7c] rounded-xl">
                  <Camera className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold">증명사진 바로 촬영하기</h3>
              </div>
              <button
                type="button"
                onClick={handleCloseCameraModal}
                className="p-1.5 text-[#8e8d88] hover:text-[#3d3d3d] hover:bg-[#f8f7f2] rounded-full transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {cameraError ? (
              <div className="text-center py-8 px-4 bg-red-50 rounded-2xl border border-red-200 text-red-800 space-y-4 w-full">
                <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
                <p className="text-sm font-semibold leading-relaxed">{cameraError}</p>
                <button
                  type="button"
                  onClick={() => {
                    handleCloseCameraModal();
                    cameraInputRef.current?.click();
                  }}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm"
                >
                  기기 카메라 앱 / 앨범 열기
                </button>
              </div>
            ) : capturedImage ? (
              <div className="w-full flex flex-col items-center space-y-4">
                <div className="relative w-48 h-64 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-md bg-slate-100">
                  <img
                    src={capturedImage}
                    alt="촬영된 증명사진"
                    className="w-full h-full object-cover"
                  />
                  {isProcessingBg && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin" />
                      <span className="text-xs font-bold">증명사진 배경 변환 중...</span>
                    </div>
                  )}
                </div>

                {/* Studio Background Picker */}
                <div className="w-full bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      증명사진 스튜디오 배경 바꾸기
                    </span>
                    {selectedBgInCamera && (
                      <button
                        type="button"
                        onClick={handleRestoreOriginalInCamera}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-0.5"
                      >
                        <RotateCcw className="w-3 h-3" /> 원본 배경
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {BACKGROUND_OPTIONS.map((bg) => (
                      <button
                        key={bg.id}
                        type="button"
                        disabled={isProcessingBg}
                        onClick={() => handleApplyBgInCamera(bg.id)}
                        className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                          selectedBgInCamera === bg.id
                            ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-300'
                            : 'border-slate-200 bg-white hover:bg-slate-100'
                        }`}
                      >
                        <span
                          className="w-6 h-6 rounded-full border border-slate-300 shadow-2xs"
                          style={{ backgroundColor: bg.previewHex }}
                        />
                        <span className="text-[10px] font-bold text-slate-700 leading-tight">
                          {bg.label.replace('스튜디오 ', '').replace('깔끔한 ', '').replace('모던 ', '').replace('따뜻한 ', '')}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setCapturedImage(null);
                      setOriginalCapturedImage(null);
                      setSelectedBgInCamera(null);
                      startCamera(facingMode);
                    }}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition"
                  >
                    다시 찍기
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmCapturedPhoto}
                    disabled={isProcessingBg}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-1 shadow-sm disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>이 사진 사용하기</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center space-y-4">
                <div className="relative w-60 h-80 bg-black rounded-2xl overflow-hidden border-2 border-[#7a8d7c] shadow-inner">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${
                      facingMode === 'user' ? 'scale-x-[-1]' : ''
                    }`}
                  />
                  {/* ID Photo Guide Overlay */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="w-36 h-48 border-2 border-dashed border-white/70 rounded-full mb-4" />
                  </div>
                </div>

                <p className="text-xs text-slate-500 text-center">
                  점선 안에 얼굴과 어깨가 들어오도록 맞춘 뒤 촬영해 주세요.
                </p>

                <div className="flex items-center gap-3 w-full">
                  <button
                    type="button"
                    onClick={() =>
                      setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
                    }
                    className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                    title="카메라 전/후면 전환"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleSnapPhoto}
                    className="flex-1 py-3.5 bg-[#7a8d7c] hover:bg-[#647566] text-white font-bold rounded-xl text-base transition flex items-center justify-center gap-2 shadow-md"
                  >
                    <Camera className="w-5 h-5" />
                    <span>찰칵! 사진 찍기</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STANDALONE STUDIO BACKGROUND EDITOR MODAL */}
      {isBgEditorOpen && bgEditorSourceImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl flex flex-col items-center relative border border-slate-200 my-auto">
            <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    증명사진 스튜디오 배경 바꾸기
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    원하는 증명사진 배경색을 선택하면 자동으로 합성됩니다.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBgEditorOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bgEditorError && (
              <div className="w-full p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl mb-3">
                {bgEditorError}
              </div>
            )}

            <div className="relative w-48 h-64 rounded-2xl overflow-hidden border-2 border-blue-500 shadow-md mb-4 bg-slate-100">
              <img
                src={bgEditorPreviewImage || bgEditorSourceImage}
                alt="배경 변환 미리보기"
                className="w-full h-full object-cover"
              />
              {isProcessingBg && (
                <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center text-white gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <span className="text-xs font-bold">배경 변환 중...</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 w-full mb-5">
              {BACKGROUND_OPTIONS.map((bg) => (
                <button
                  key={bg.id}
                  type="button"
                  disabled={isProcessingBg}
                  onClick={() => handleRunBgEditorPreview(bgEditorSourceImage, bg.id)}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2.5 ${
                    selectedEditorBg === bg.id
                      ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="w-7 h-7 rounded-full border border-slate-300 shrink-0 shadow-2xs"
                    style={{ backgroundColor: bg.previewHex }}
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">{bg.label}</p>
                    <p className="text-[10px] text-slate-500">{bg.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-2 w-full">
              <button
                type="button"
                onClick={() => setIsBgEditorOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleApplyBgEditor}
                disabled={isProcessingBg}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>적용하기</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
