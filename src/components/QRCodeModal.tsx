import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { QrCode, X, Copy, Check, Download, Printer, Smartphone } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl?: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  appUrl,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const targetUrl =
    appUrl ||
    (typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ais-pre-w7r4kv7gbtmlhs7kagbvum-368891413016.asia-northeast1.run.app');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('주소 복사에 실패했습니다. 아래 주소를 직접 복사해 주세요.');
    }
  };

  const handleDownloadQR = () => {
    const canvas = document.getElementById('suwon-resume-qr-canvas') as HTMLCanvasElement | null;
    if (!canvas) return;
    const pngUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = '수원시장애인종합복지관_쉬운이력서_QR.png';
    link.click();
  };

  const handlePrintPoster = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:bg-white print:p-0">
      <div
        id="qr-poster-print"
        className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 my-auto print:shadow-none print:border-none"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5 print:hidden">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                접속용 QR코드 안내
              </h3>
              <p className="text-xs text-slate-500">
                스마트폰 카메라로 스캔하면 바로 접속됩니다
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Poster Card */}
        <div className="bg-[#f8f7f2] border-2 border-[#7a8d7c] rounded-2xl p-6 text-center space-y-4">
          <div>
            <p className="text-xs font-bold text-[#7a8d7c]">
              수원시장애인종합복지관
            </p>
            <h4 className="text-xl font-black text-slate-900 mt-1">
              알기 쉬운 이력서 작성하기
            </h4>
            <p className="text-xs text-slate-600 mt-1 flex items-center justify-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
              로그인 없이 누구나 쉽고 빠르게 작성!
            </p>
          </div>

          <div className="inline-block bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <QRCodeCanvas
              id="suwon-resume-qr-canvas"
              value={targetUrl}
              size={200}
              bgColor="#ffffff"
              fgColor="#1e293b"
              level="H"
            />
          </div>

          <p className="text-[11px] text-slate-500 break-all bg-white px-3 py-2 rounded-xl border border-slate-200">
            {targetUrl}
          </p>
        </div>

        {/* Modal Actions */}
        <div className="mt-5 grid grid-cols-3 gap-2 print:hidden">
          <button
            type="button"
            onClick={handleCopy}
            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>복사됨</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>링크 복사</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadQR}
            className="py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>이미지 저장</span>
          </button>

          <button
            type="button"
            onClick={handlePrintPoster}
            className="py-2.5 px-3 bg-[#7a8d7c] hover:bg-[#647566] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>안내문 출력</span>
          </button>
        </div>
      </div>
    </div>
  );
};
